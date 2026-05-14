import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private supabase: SupabaseService,
    private prisma: PrismaService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      const { data, error } = await this.supabase.anon.auth.signUp({
        email: dto.email,
        password: dto.password,
        options: {
          data: { name: dto.name },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          throw new ConflictException('Email đã được đăng ký');
        }
        throw new BadRequestException(error.message);
      }

      // Upsert profile vào Prisma ngay khi đăng ký
      if (data.user) {
        await this.upsertPrismaUser(data.user.id, dto.email, dto.name);
      }

      return {
        message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
      };
    } catch (err) {
      if (err instanceof ConflictException || err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException('Lỗi đăng ký, vui lòng thử lại');
    }
  }

  async login(dto: LoginDto) {
    try {
      const { data, error } = await this.supabase.anon.auth.signInWithPassword({
        email: dto.email,
        password: dto.password,
      });

      if (error) {
        throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
      }

      if (!data.session) {
        throw new UnauthorizedException('Không thể tạo session');
      }

      // Upsert Prisma user và lấy role từ DB
      const prismaUser = await this.upsertPrismaUser(
        data.user.id,
        data.user.email!,
        data.user.user_metadata?.name,
        data.user.user_metadata?.avatar_url,
      );

      return {
        session: data.session,
        user: {
          id: prismaUser.id,
          email: prismaUser.email,
          name: prismaUser.name,
          role: prismaUser.role,   // role lấy từ Prisma, không trust JWT
          avatar: prismaUser.avatar,
        },
      };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new InternalServerErrorException('Lỗi đăng nhập, vui lòng thử lại');
    }
  }

  async getMe(supabaseUserId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: supabaseUserId },
        select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true },
      });

      if (!user) throw new UnauthorizedException('User không tồn tại');
      return user;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new InternalServerErrorException('Lỗi lấy thông tin user');
    }
  }

  async refreshSession(refreshToken: string) {
    try {
      const { data, error } = await this.supabase.admin.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error || !data.session) {
        throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
      }

      return data.session;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new InternalServerErrorException('Lỗi refresh token');
    }
  }

  // Cookie được clear ở controller, token Supabase tự hết hạn sau 1h
  async signOut(_accessToken: string) {
    // no-op: cookie clearing handled in controller
  }

  // Tạo OAuth URL và trả về pkceState (base64 của storage snapshot) để lưu vào httpOnly cookie.
  // Dùng fresh client per-request để tránh race condition khi nhiều user OAuth đồng thời.
  async getOAuthUrl(provider: 'google'): Promise<{ url: string; pkceState: string }> {
    try {
      const pkceStore: Record<string, string> = {};
      const storage = {
        getItem: (key: string) => pkceStore[key] ?? null,
        setItem: (key: string, value: string) => { pkceStore[key] = value; },
        removeItem: (key: string) => { delete pkceStore[key]; },
      };

      const client = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        { auth: { storage, autoRefreshToken: false, persistSession: true, flowType: 'pkce', } },
      );

      const { data, error } = await client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${process.env.BACKEND_URL}/api/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });

      if (error || !data.url) {
        throw new InternalServerErrorException('Không thể tạo OAuth URL');
      }

      // Serialize toàn bộ PKCE storage để lưu vào httpOnly cookie
      const pkceState = Buffer.from(JSON.stringify(pkceStore)).toString('base64');
      return { url: data.url, pkceState };
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException('Lỗi khởi tạo Google OAuth');
    }
  }

  // Khôi phục PKCE storage từ cookie, tạo fresh client, exchange code.
  async handleOAuthCallback(code: string, pkceState: string) {
    try {
      const pkceStore: Record<string, string> = JSON.parse(
        Buffer.from(pkceState, 'base64').toString(),
      );

      const storage = {
        getItem: (key: string) => pkceStore[key] ?? null,
        setItem: (key: string, value: string) => { pkceStore[key] = value; },
        removeItem: (key: string) => { delete pkceStore[key]; },
      };

      const client = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        { auth: { storage, autoRefreshToken: false, persistSession: true, flowType: 'pkce', } },
      );

      const { data, error } = await client.auth.exchangeCodeForSession(code);

      if (error || !data.session) {
        throw new UnauthorizedException('OAuth callback thất bại');
      }

      await this.upsertPrismaUser(
        data.user.id,
        data.user.email!,
        data.user.user_metadata?.full_name || data.user.user_metadata?.name,
        data.user.user_metadata?.avatar_url,
      );

      return data.session;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new InternalServerErrorException('Lỗi xử lý OAuth callback');
    }
  }

  // Sync Supabase user vào Prisma, role luôn lấy từ DB
  async upsertPrismaUser(
    supabaseId: string,
    email: string,
    name?: string,
    avatar?: string,
  ) {
    try {
      return await this.prisma.user.upsert({
        where: { id: supabaseId },
        update: {
          email,
          ...(name && { name }),
          ...(avatar && { avatar }),
        },
        create: {
          id: supabaseId,
          email,
          name: name ?? null,
          avatar: avatar ?? null,
        },
      });
    } catch (err) {
    // P2002: email tồn tại với Supabase ID khác
    // (user đã đăng ký email/password, nay login Google cùng email)
    if ((err as any)?.code === 'P2002') {
      return await this.prisma.user.update({
        where: { email },           // tìm theo email (unique)
        data: {
          id: supabaseId,           // cập nhật ID sang OAuth Supabase ID
          ...(name && { name }),
          ...(avatar && { avatar }),
        },
      });
    }
    throw new InternalServerErrorException('Lỗi đồng bộ user profile');
  }
  }
}
