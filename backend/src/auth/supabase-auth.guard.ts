import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.cookies?.access_token;

    if (!accessToken) throw new UnauthorizedException('Chưa đăng nhập');

    try {
      const { data, error } = await this.supabase.anon.auth.getUser(accessToken);

      if (error || !data.user) {
        throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
      }

      // Gắn user vào request — role sẽ được service tự lấy từ Prisma khi cần
      request.user = { sub: data.user.id, email: data.user.email };
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Lỗi xác thực token');
    }
  }
}
