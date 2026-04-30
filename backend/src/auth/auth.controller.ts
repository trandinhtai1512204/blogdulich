import { Controller, Post, Get, Body, UseGuards, Req, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Response } from 'express';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
  @Get('google')
@UseGuards(AuthGuard('google'))
googleAuth() {
  // Passport redirect tự động
}
 
@Get('google/callback')
@UseGuards(AuthGuard('google'))
googleCallback(@Req() req: any, @Res() res: Response) {
  const { access_token } = req.user;
  // Redirect về frontend với token
  res.redirect(`${process.env.CLIENT_URL}/auth/google/callback?token=${access_token}`);
}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: any) {
    return this.authService.getMe(req.user.sub);
  }

  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  resendVerification(@Body('email') email: string) {
    return this.authService.resendVerification(email);
  }
}