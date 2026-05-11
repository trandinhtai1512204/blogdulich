import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        message: string;
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        message: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            role: import(".prisma/client").$Enums.Role;
            avatar: string | null;
        };
    }>;
    logout(req: Request, res: Response): Promise<{
        message: string;
    }>;
    refresh(req: Request, res: Response): Promise<{
        message: string;
    }>;
    getMe(req: any): Promise<{
        id: string;
        email: string;
        name: string | null;
        avatar: string | null;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
    }>;
    googleAuth(res: Response): Promise<void>;
    oauthCallback(code: string, req: Request, res: Response): Promise<void>;
}
