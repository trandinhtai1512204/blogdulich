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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const register_dto_1 = require("./dto/register.dto");
const supabase_auth_guard_1 = require("./supabase-auth.guard");
const sameSite = process.env.NODE_ENV === 'production' ? 'none' : 'lax';
function getCookie(req, name) {
    const cookies = req.cookies;
    return cookies?.[name];
}
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite,
    path: '/',
};
const PKCE_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite,
    path: '/api/auth',
    maxAge: 10 * 60 * 1000,
};
function setAuthCookies(res, accessToken, refreshToken, accessTokenExpiresInSeconds = 60 * 60) {
    res.cookie('access_token', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: accessTokenExpiresInSeconds * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}
function clearAuthCookies(res) {
    res.clearCookie('access_token', { ...COOKIE_OPTIONS });
    res.clearCookie('refresh_token', { ...COOKIE_OPTIONS });
}
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    register(dto) {
        return this.authService.register(dto);
    }
    async login(dto, res) {
        const { session, user } = await this.authService.login(dto);
        setAuthCookies(res, session.access_token, session.refresh_token, session.expires_in);
        return { message: 'Dang nhap thanh cong', user };
    }
    async logout(req, res) {
        const accessToken = getCookie(req, 'access_token');
        if (accessToken) {
            await this.authService.signOut(accessToken);
        }
        clearAuthCookies(res);
        return { message: 'Dang xuat thanh cong' };
    }
    async refresh(req, res) {
        const refreshToken = getCookie(req, 'refresh_token');
        if (!refreshToken) {
            clearAuthCookies(res);
            throw new common_1.UnauthorizedException('Khong co refresh token');
        }
        try {
            const session = await this.authService.refreshSession(refreshToken);
            setAuthCookies(res, session.access_token, session.refresh_token, session.expires_in);
            return { message: 'Token da duoc lam moi' };
        }
        catch (err) {
            clearAuthCookies(res);
            throw err;
        }
    }
    getMe(req) {
        return this.authService.getMe(req.user.sub);
    }
    async googleAuth(res) {
        const { url, pkceState } = await this.authService.getOAuthUrl('google');
        res.cookie('pkce_state', pkceState, PKCE_COOKIE_OPTIONS);
        res.redirect(url);
    }
    async oauthCallback(code, req, res) {
        const pkceState = getCookie(req, 'pkce_state');
        res.clearCookie('pkce_state', PKCE_COOKIE_OPTIONS);
        if (!code || !pkceState) {
            return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
        }
        try {
            const session = await this.authService.handleOAuthCallback(code, pkceState);
            setAuthCookies(res, session.access_token, session.refresh_token, session.expires_in);
            res.redirect(`${process.env.CLIENT_URL}/auth/google/callback`);
        }
        catch (err) {
            console.log('[OAuth callback] ERROR:', err instanceof Error ? err.message : err);
            res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getMe", null);
__decorate([
    (0, common_1.Get)('google'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuth", null);
__decorate([
    (0, common_1.Get)('callback'),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "oauthCallback", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map