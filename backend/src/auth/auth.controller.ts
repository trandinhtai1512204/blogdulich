import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SupabaseAuthGuard } from './supabase-auth.guard';

type CookieBag = {
  cookies?: Record<string, string | undefined>;
};

type AuthenticatedRequest = Request & {
  user: { sub: string };
};

const sameSite: 'none' | 'lax' =
  process.env.NODE_ENV === 'production' ? 'none' : 'lax';

function getCookie(req: Request, name: string) {
  const cookies = (req as unknown as CookieBag).cookies;
  return cookies?.[name];
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite,
  path: '/',
};

const PKCE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite,
  path: '/api/auth',
  maxAge: 10 * 60 * 1000,
};

function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  accessTokenExpiresInSeconds = 60 * 60,
) {
  res.cookie('access_token', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: accessTokenExpiresInSeconds * 1000,
  });
  res.cookie('refresh_token', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000,
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
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { session, user } = await this.authService.login(dto);
    setAuthCookies(
      res,
      session.access_token,
      session.refresh_token,
      session.expires_in,
    );
    return { message: 'Dang nhap thanh cong', user };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const accessToken = getCookie(req, 'access_token');
    if (accessToken) {
      await this.authService.signOut(accessToken);
    }
    clearAuthCookies(res);
    return { message: 'Dang xuat thanh cong' };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = getCookie(req, 'refresh_token');
    if (!refreshToken) {
      clearAuthCookies(res);
      throw new UnauthorizedException('Khong co refresh token');
    }

    try {
      const session = await this.authService.refreshSession(refreshToken);
      setAuthCookies(
        res,
        session.access_token,
        session.refresh_token,
        session.expires_in,
      );
      return { message: 'Token da duoc lam moi' };
    } catch (err) {
      clearAuthCookies(res);
      throw err;
    }
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  getMe(@Req() req: AuthenticatedRequest) {
    return this.authService.getMe(req.user.sub);
  }

  @Get('google')
  async googleAuth(@Res() res: Response) {
    const { url, pkceState } = await this.authService.getOAuthUrl('google');
    res.cookie('pkce_state', pkceState, PKCE_COOKIE_OPTIONS);
    res.redirect(url);
  }

  @Get('callback')
  async oauthCallback(
    @Query('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const pkceState = getCookie(req, 'pkce_state');
    res.clearCookie('pkce_state', PKCE_COOKIE_OPTIONS);

    if (!code || !pkceState) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }

    try {
      const session = await this.authService.handleOAuthCallback(
        code,
        pkceState,
      );
      setAuthCookies(
        res,
        session.access_token,
        session.refresh_token,
        session.expires_in,
      );
      res.redirect(`${process.env.CLIENT_URL}/auth/google/callback`);
    } catch (err) {
      console.log(
        '[OAuth callback] ERROR:',
        err instanceof Error ? err.message : err,
      );
      res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
  }
}
