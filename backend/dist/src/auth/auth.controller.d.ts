import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    googleAuth(): void;
    googleCallback(req: any, res: Response): void;
    getMe(req: any): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.Role;
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
}
