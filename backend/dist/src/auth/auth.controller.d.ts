import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
type AuthenticatedRequest = Request & {
    user: {
        sub: string;
    };
};
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
    getMe(req: AuthenticatedRequest): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        email: string;
        avatar: string | null;
        role: import(".prisma/client").$Enums.Role;
    }>;
    googleAuth(req: Request, res: Response): Promise<void>;
    oauthCallback(code: string, req: Request, res: Response): Promise<void>;
}
export {};
