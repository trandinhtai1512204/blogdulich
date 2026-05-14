import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { SupabaseService } from '../supabase/supabase.service';

type AuthRequest = Request & {
  user?: { sub: string; email?: string };
};

function getCookie(req: Request, name: string) {
  const cookies = (
    req as unknown as { cookies?: Record<string, string | undefined> }
  ).cookies;
  return cookies?.[name];
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const accessToken = getCookie(request, 'access_token');

    if (!accessToken) throw new UnauthorizedException('Chua dang nhap');

    try {
      const { data, error } =
        await this.supabase.admin.auth.getUser(accessToken);

      if (error || !data.user) {
        throw new UnauthorizedException('Token khong hop le hoac da het han');
      }

      request.user = { sub: data.user.id, email: data.user.email };
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Loi xac thuc token');
    }
  }
}
