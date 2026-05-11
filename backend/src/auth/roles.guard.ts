import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// AdminGuard phải dùng SAU SupabaseAuthGuard.
// Role lấy từ Prisma DB, không trust JWT payload.
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const supabaseId = request.user?.sub;

    if (!supabaseId) throw new UnauthorizedException('Chưa đăng nhập');

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: supabaseId },
        select: { role: true },
      });

      if (user?.role !== 'admin') {
        throw new ForbiddenException('Chỉ admin mới có quyền này');
      }

      return true;
    } catch (err) {
      if (err instanceof ForbiddenException || err instanceof UnauthorizedException) throw err;
      throw new ForbiddenException('Không thể xác minh quyền admin');
    }
  }
}
