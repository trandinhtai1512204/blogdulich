"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_service_1 = require("../supabase/supabase.service");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    supabase;
    prisma;
    constructor(supabase, prisma) {
        this.supabase = supabase;
        this.prisma = prisma;
    }
    async register(dto) {
        try {
            const { data, error } = await this.supabase.anon.auth.signUp({
                email: dto.email,
                password: dto.password,
                options: {
                    data: { name: dto.name },
                },
            });
            if (error) {
                if (error.message.includes('already registered')) {
                    throw new common_1.ConflictException('Email đã được đăng ký');
                }
                throw new common_1.BadRequestException(error.message);
            }
            if (data.user) {
                await this.upsertPrismaUser(data.user.id, dto.email, dto.name);
            }
            return {
                message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
            };
        }
        catch (err) {
            if (err instanceof common_1.ConflictException ||
                err instanceof common_1.BadRequestException) {
                throw err;
            }
            throw new common_1.InternalServerErrorException('Lỗi đăng ký, vui lòng thử lại');
        }
    }
    async login(dto) {
        try {
            const { data, error } = await this.supabase.anon.auth.signInWithPassword({
                email: dto.email,
                password: dto.password,
            });
            if (error) {
                const msg = error.message?.toLowerCase() ?? '';
                if (msg.includes('not confirmed') || msg.includes('email not')) {
                    throw new common_1.UnauthorizedException('Tài khoản chưa xác thực email. Vui lòng kiểm tra hộp thư.');
                }
                throw new common_1.UnauthorizedException('Email hoặc mật khẩu không đúng');
            }
            if (!data.session) {
                throw new common_1.UnauthorizedException('Không thể tạo session');
            }
            const prismaUser = await this.upsertPrismaUser(data.user.id, data.user.email, data.user.user_metadata?.name, data.user.user_metadata?.avatar_url);
            return {
                session: data.session,
                user: {
                    id: prismaUser.id,
                    email: prismaUser.email,
                    name: prismaUser.name,
                    role: prismaUser.role,
                    avatar: prismaUser.avatar,
                },
            };
        }
        catch (err) {
            if (err instanceof common_1.UnauthorizedException)
                throw err;
            throw new common_1.InternalServerErrorException('Lỗi đăng nhập, vui lòng thử lại');
        }
    }
    async getMe(supabaseUserId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: supabaseUserId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    avatar: true,
                    createdAt: true,
                },
            });
            if (!user)
                throw new common_1.UnauthorizedException('User không tồn tại');
            return user;
        }
        catch (err) {
            if (err instanceof common_1.UnauthorizedException)
                throw err;
            throw new common_1.InternalServerErrorException('Lỗi lấy thông tin user');
        }
    }
    async refreshSession(refreshToken) {
        try {
            const { data, error } = await this.supabase.admin.auth.refreshSession({
                refresh_token: refreshToken,
            });
            if (error || !data.session) {
                throw new common_1.UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
            }
            return data.session;
        }
        catch (err) {
            if (err instanceof common_1.UnauthorizedException)
                throw err;
            throw new common_1.InternalServerErrorException('Lỗi refresh token');
        }
    }
    async signOut(_accessToken) {
    }
    async getOAuthUrl(provider, redirectTo, clientUrl) {
        try {
            const pkceStore = {};
            const storage = {
                getItem: (key) => pkceStore[key] ?? null,
                setItem: (key, value) => {
                    pkceStore[key] = value;
                },
                removeItem: (key) => {
                    delete pkceStore[key];
                },
            };
            const client = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
                auth: {
                    storage,
                    autoRefreshToken: false,
                    persistSession: true,
                    flowType: 'pkce',
                },
            });
            const { data, error } = await client.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo,
                    queryParams: { access_type: 'offline', prompt: 'consent' },
                },
            });
            if (error || !data.url) {
                throw new common_1.InternalServerErrorException('Không thể tạo OAuth URL');
            }
            const pkceState = Buffer.from(JSON.stringify({ storage: pkceStore, clientUrl })).toString('base64');
            return { url: data.url, pkceState };
        }
        catch (err) {
            if (err instanceof common_1.InternalServerErrorException)
                throw err;
            throw new common_1.InternalServerErrorException('Lỗi khởi tạo Google OAuth');
        }
    }
    async handleOAuthCallback(code, pkceState) {
        try {
            const parsedState = JSON.parse(Buffer.from(pkceState, 'base64').toString());
            const pkceStore = parsedState.storage && typeof parsedState.storage === 'object'
                ? parsedState.storage
                : parsedState;
            const storage = {
                getItem: (key) => pkceStore[key] ?? null,
                setItem: (key, value) => {
                    pkceStore[key] = value;
                },
                removeItem: (key) => {
                    delete pkceStore[key];
                },
            };
            const client = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
                auth: {
                    storage,
                    autoRefreshToken: false,
                    persistSession: true,
                    flowType: 'pkce',
                },
            });
            const { data, error } = await client.auth.exchangeCodeForSession(code);
            if (error || !data.session) {
                throw new common_1.UnauthorizedException('OAuth callback thất bại');
            }
            await this.upsertPrismaUser(data.user.id, data.user.email, data.user.user_metadata?.full_name || data.user.user_metadata?.name, data.user.user_metadata?.avatar_url);
            return data.session;
        }
        catch (err) {
            if (err instanceof common_1.UnauthorizedException)
                throw err;
            throw new common_1.InternalServerErrorException('Lỗi xử lý OAuth callback');
        }
    }
    async upsertPrismaUser(supabaseId, email, name, avatar) {
        try {
            return await this.prisma.user.upsert({
                where: { id: supabaseId },
                update: {
                    email,
                    ...(name && { name }),
                    ...(avatar && { avatar }),
                },
                create: {
                    id: supabaseId,
                    email,
                    name: name ?? null,
                    avatar: avatar ?? null,
                },
            });
        }
        catch (err) {
            if (err?.code === 'P2002') {
                return await this.prisma.user.update({
                    where: { email },
                    data: {
                        id: supabaseId,
                        ...(name && { name }),
                        ...(avatar && { avatar }),
                    },
                });
            }
            throw new common_1.InternalServerErrorException('Lỗi đồng bộ user profile');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map