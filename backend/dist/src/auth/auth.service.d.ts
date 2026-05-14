import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private supabase;
    private prisma;
    constructor(supabase: SupabaseService, prisma: PrismaService);
    register(dto: RegisterDto): Promise<{
        message: string;
    }>;
    login(dto: LoginDto): Promise<{
        session: import("@supabase/supabase-js").AuthSession;
        user: {
            id: string;
            email: string;
            name: string | null;
            role: import(".prisma/client").$Enums.Role;
            avatar: string | null;
        };
    }>;
    getMe(supabaseUserId: string): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        email: string;
        avatar: string | null;
        role: import(".prisma/client").$Enums.Role;
    }>;
    refreshSession(refreshToken: string): Promise<import("@supabase/supabase-js").AuthSession>;
    signOut(_accessToken: string): Promise<void>;
    getOAuthUrl(provider: 'google'): Promise<{
        url: string;
        pkceState: string;
    }>;
    handleOAuthCallback(code: string, pkceState: string): Promise<import("@supabase/supabase-js").AuthSession>;
    upsertPrismaUser(supabaseId: string, email: string, name?: string, avatar?: string): Promise<{
        id: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        avatar: string | null;
        role: import(".prisma/client").$Enums.Role;
    }>;
}
