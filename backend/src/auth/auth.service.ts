import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email đã tồn tại');

    const hashed = await bcrypt.hash(dto.password, 10);
    const verifyToken = uuidv4();
    const verifyTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        name: dto.name,
        verifyToken,
        verifyTokenExp,
        isVerified: false,
      },
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}`;

    try {
      await this.mailService.sendVerificationEmail({
        toEmail: user.email,
        toName: user.name || 'Bạn',
        verifyUrl,
      });
    } catch (e) {
      console.log('⚠️ Email failed:', e.message);
    }

    return {
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Email hoặc password không đúng');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Email hoặc password không đúng');

    if (!user.isVerified) {
      throw new UnauthorizedException('Vui lòng xác thực email trước khi đăng nhập');
    }

    const token = this.signToken(user.id, user.email, user.role);
    return {
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
      ...token,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });
    if (!user) throw new UnauthorizedException('User không tồn tại');
    return user;
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { verifyToken: token },
    });

    if (!user) throw new BadRequestException('Token không hợp lệ');
    if (user.verifyTokenExp && user.verifyTokenExp < new Date()) {
      throw new BadRequestException('Token đã hết hạn, vui lòng gửi lại email xác thực');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verifyToken: null,
        verifyTokenExp: null,
      },
    });

    const tokenData = this.signToken(user.id, user.email, user.role);
    return {
      message: 'Xác thực email thành công!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: true,
      },
      ...tokenData,
    };
  }

  async resendVerification(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Email không tồn tại');
    if (user.isVerified) throw new BadRequestException('Email đã được xác thực rồi');

    const verifyToken = uuidv4();
    const verifyTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { verifyToken, verifyTokenExp },
    });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}`;
    await this.mailService.sendVerificationEmail({
      toEmail: user.email,
      toName: user.name || 'Bạn',
      verifyUrl,
    });

    return { message: 'Đã gửi lại email xác thực!' };
  }
  async findOrCreateGoogleUser(data: { email: string; name: string; avatar?: string }) {
  let user = await this.prisma.user.findUnique({ where: { email: data.email } });
 
  if (!user) {
    user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: '',           // Google user không cần password
        isVerified: true,    // Google đã verify rồi
      },
    });
  }
 
  return this.signToken(user.id, user.email, user.role);
  }

  private signToken(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const access_token = this.jwt.sign(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_SECRET,
    });
    return { access_token };
  }

}