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

const isProductionLike =
  process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
const sameSite: 'none' | 'lax' = isProductionLike ? 'none' : 'lax';
const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

function getCookie(req: Request, name: string) {
  const cookies = (req as unknown as CookieBag).cookies;
  return cookies?.[name];
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProductionLike,
  sameSite,
  path: '/',
  ...(cookieDomain && { domain: cookieDomain }),
};

const PKCE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProductionLike,
  sameSite,
  path: '/api/auth',
  ...(cookieDomain && { domain: cookieDomain }),
  maxAge: 10 * 60 * 1000,
};

const ALLOWED_CLIENT_ORIGINS = [
  'http://localhost:3000',
  process.env.CLIENT_URL,
  'https://blogdulich.vn',
  'https://www.blogdulich.vn',
  'https://frontend-gilt-two-35.vercel.app',
].filter(Boolean) as string[];

function toOrigin(value?: string) {
  if (!value) return undefined;

  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
}

function getPublicOrigin(req: Request) {
  const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const forwardedHost = req.get('x-forwarded-host')?.split(',')[0]?.trim();
  const proto = forwardedProto || req.protocol;
  const host = forwardedHost || req.get('host');

  return `${proto}://${host}`;
}

function getClientOrigin(req: Request) {
  const refererOrigin = toOrigin(req.get('referer'));
  if (refererOrigin && ALLOWED_CLIENT_ORIGINS.includes(refererOrigin)) {
    return refererOrigin;
  }

  return process.env.CLIENT_URL || 'http://localhost:3000';
}

function getClientOriginFromState(pkceState?: string) {
  if (!pkceState) return undefined;

  try {
    const parsed = JSON.parse(Buffer.from(pkceState, 'base64').toString());
    const clientUrl =
      typeof parsed.clientUrl === 'string' ? parsed.clientUrl : undefined;

    if (clientUrl && ALLOWED_CLIENT_ORIGINS.includes(clientUrl)) {
      return clientUrl;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

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
  @Throttle({ default: { limit: 30, ttl: 60000 } })
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
  async googleAuth(@Req() req: Request, @Res() res: Response) {
    const redirectTo = `${getPublicOrigin(req)}/api/auth/callback`;
    const clientUrl = getClientOrigin(req);
    const { url, pkceState } = await this.authService.getOAuthUrl(
      'google',
      redirectTo,
      clientUrl,
    );
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
    const clientUrl =
      getClientOriginFromState(pkceState) || getClientOrigin(req);

    if (!code || !pkceState) {
      return res.redirect(`${clientUrl}/login?error=oauth_failed`);
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
      res.redirect(`${clientUrl}/auth/google/callback`);
    } catch (err) {
      console.log(
        '[OAuth callback] ERROR:',
        err instanceof Error ? err.message : err,
      );
      res.redirect(`${clientUrl}/login?error=oauth_failed`);
    }
  }
}
