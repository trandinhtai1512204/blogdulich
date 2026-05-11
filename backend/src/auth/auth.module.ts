import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseAuthGuard } from './supabase-auth.guard';
import { AdminGuard } from './roles.guard';

@Module({
  providers: [AuthService, SupabaseAuthGuard, AdminGuard],
  controllers: [AuthController],
  exports: [AuthService, SupabaseAuthGuard, AdminGuard],
})
export class AuthModule {}
