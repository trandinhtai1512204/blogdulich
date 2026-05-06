"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
const bcrypt = __importStar(require("bcrypt"));
const uuid_1 = require("uuid");
let AuthService = class AuthService {
    prisma;
    jwt;
    mailService;
    constructor(prisma, jwt, mailService) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.mailService = mailService;
    }
    async register(dto) {
        const exists = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (exists)
            throw new common_1.ConflictException('Email đã tồn tại');
        const hashed = await bcrypt.hash(dto.password, 10);
        const verifyToken = (0, uuid_1.v4)();
        const verifyTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashed,
                name: dto.name,
                verifyToken,
                verifyTokenExp,
                isVerified: false,
            },
        });
        const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}`;
        try {
            await this.mailService.sendVerificationEmail({
                toEmail: user.email,
                toName: user.name || 'Bạn',
                verifyUrl,
            });
        }
        catch (e) {
            console.log('⚠️ Email failed:', e.message);
        }
        return {
            message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isVerified: user.isVerified,
            },
        };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user)
            throw new common_1.UnauthorizedException('Email hoặc password không đúng');
        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Email hoặc password không đúng');
        if (!user.isVerified) {
            throw new common_1.UnauthorizedException('Vui lòng xác thực email trước khi đăng nhập');
        }
        const token = this.signToken(user.id, user.email, user.role);
        return {
            message: 'Đăng nhập thành công',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isVerified: user.isVerified,
            },
            ...token,
        };
    }
    async getMe(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isVerified: true,
                createdAt: true,
            },
        });
        if (!user)
            throw new common_1.UnauthorizedException('User không tồn tại');
        return user;
    }
    async verifyEmail(token) {
        const user = await this.prisma.user.findFirst({
            where: { verifyToken: token },
        });
        if (!user)
            throw new common_1.BadRequestException('Token không hợp lệ');
        if (user.verifyTokenExp && user.verifyTokenExp < new Date()) {
            throw new common_1.BadRequestException('Token đã hết hạn, vui lòng gửi lại email xác thực');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verifyToken: null,
                verifyTokenExp: null,
            },
        });
        const tokenData = this.signToken(user.id, user.email, user.role);
        return {
            message: 'Xác thực email thành công!',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isVerified: true,
            },
            ...tokenData,
        };
    }
    async resendVerification(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new common_1.BadRequestException('Email không tồn tại');
        if (user.isVerified)
            throw new common_1.BadRequestException('Email đã được xác thực rồi');
        const verifyToken = (0, uuid_1.v4)();
        const verifyTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { verifyToken, verifyTokenExp },
        });
        const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}`;
        await this.mailService.sendVerificationEmail({
            toEmail: user.email,
            toName: user.name || 'Bạn',
            verifyUrl,
        });
        return { message: 'Đã gửi lại email xác thực!' };
    }
    async findOrCreateGoogleUser(data) {
        let user = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email: data.email,
                    name: data.name,
                    password: '',
                    isVerified: true,
                },
            });
        }
        return this.signToken(user.id, user.email, user.role);
    }
    signToken(userId, email, role) {
        const payload = { sub: userId, email, role };
        const access_token = this.jwt.sign(payload, {
            expiresIn: '7d',
            secret: process.env.JWT_SECRET,
        });
        return { access_token };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map