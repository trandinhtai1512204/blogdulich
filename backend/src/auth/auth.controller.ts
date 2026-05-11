import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SupabaseAuthGuard } from './supabase-auth.guard';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

// Cookie lưu PKCE code_verifier giữa 2 request OAuth (GET /google → GET /callback).
// Giới hạn path và TTL ngắn để giảm surface attack.
const PKCE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/auth',
  maxAge: 10 * 60 * 1000, // 10 phút
};

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('access_token', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 1000,          // 1 giờ
  });
  res.cookie('refresh_token', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
  });
}

function clearAuthCookies(res: Response) {
  res.clearCookie('access_token', { ...COOKIE_OPTIONS });
  res.clearCookie('refresh_token', { ...COOKIE_OPTIONS });
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { session, user } = await this.authService.login(dto);
    setAuthCookies(res, session.access_token, session.refresh_token);
    return { message: 'Đăng nhập thành công', user };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const accessToken = req.cookies?.access_token;
    if (accessToken) {
      await this.authService.signOut(accessToken);
    }
    clearAuthCookies(res);
    return { message: 'Đăng xuất thành công' };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) throw new UnauthorizedException('Không có refresh token');

    const session = await this.authService.refreshSession(refreshToken);
    setAuthCookies(res, session.access_token, session.refresh_token);
    return { message: 'Token đã được làm mới' };
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  getMe(@Req() req: any) {
    return this.authService.getMe(req.user.sub);
  }

  // Tạo Supabase OAuth URL, lưu PKCE state vào httpOnly cookie rồi redirect
  @Get('google')
  async googleAuth(@Res() res: Response) {
    const { url, pkceState } = await this.authService.getOAuthUrl('google');
    res.cookie('pkce_state', pkceState, PKCE_COOKIE_OPTIONS);
    res.redirect(url);
  }

  // Supabase redirect về đây với ?code=xxx
  // Dùng PKCE state từ cookie để exchange code an toàn
  @Get('callback')
  async oauthCallback(
    @Query('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const pkceState = req.cookies?.pkce_state;
    res.clearCookie('pkce_state', PKCE_COOKIE_OPTIONS);

    if (!code || !pkceState) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }

    try {
      const session = await this.authService.handleOAuthCallback(code, pkceState);
      setAuthCookies(res, session.access_token, session.refresh_token);
      res.redirect(`${process.env.CLIENT_URL}/auth/google/callback`);
    } catch (err) {
      console.log('[OAuth callback] ERROR:', err?.message || err);
      res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
  }
}
