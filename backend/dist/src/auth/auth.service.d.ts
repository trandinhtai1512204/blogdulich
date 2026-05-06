import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../mail/mail.service';
export declare class AuthService {
    private prisma;
    private jwt;
    private mailService;
    constructor(prisma: PrismaService, jwt: JwtService, mailService: MailService);
    register(dto: RegisterDto): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            role: import(".prisma/client").$Enums.Role;
            isVerified: boolean;
        };
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        message: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            role: import(".prisma/client").$Enums.Role;
            isVerified: true;
        };
    }>;
    getMe(userId: string): Promise<{
        email: string;
        name: string | null;
        id: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        isVerified: boolean;
    }>;
    verifyEmail(token: string): Promise<{
        access_token: string;
        message: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            role: import(".prisma/client").$Enums.Role;
            isVerified: boolean;
        };
    }>;
    resendVerification(email: string): Promise<{
        message: string;
    }>;
    findOrCreateGoogleUser(data: {
        email: string;
        name: string;
        avatar?: string;
    }): Promise<{
        access_token: string;
    }>;
    private signToken;
}
