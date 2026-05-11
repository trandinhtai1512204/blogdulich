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
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const post_canonical_1 = require("./post-canonical");
let PostsService = class PostsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { cityId, categoryId, search, page = '1', limit = '10' } = query;
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        const where = { published: true };
        if (cityId)
            where.cityId = cityId;
        if (categoryId)
            where.categoryId = categoryId;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { excerpt: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.post.findMany({
                where,
                skip: (pageNumber - 1) * limitNumber,
                take: limitNumber,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    excerpt: true,
                    thumbnail: true,
                    published: true,
                    cityId: true,
                    categoryId: true,
                    createdAt: true,
                    city: { select: { id: true, name: true, slug: true } },
                    category: { select: post_canonical_1.CATEGORY_WITH_ANCESTORS_SELECT },
                },
            }),
            this.prisma.post.count({ where }),
        ]);
        const enriched = data.map((p) => ({
            ...p,
            canonicalUrl: (0, post_canonical_1.computePostCanonicalPath)(p),
        }));
        return {
            data: enriched,
            meta: { total, page: pageNumber, limit: limitNumber, totalPages: Math.ceil(total / limitNumber) },
        };
    }
    async findOne(slug) {
        const post = await this.prisma.post.findFirst({
            where: { slug, published: true },
            include: {
                city: true,
                category: true,
            },
        });
        if (!post)
            throw new common_1.NotFoundException('Bài viết không tồn tại');
        return post;
    }
    async create(dto) {
        try {
            return await this.prisma.post.create({ data: dto });
        }
        catch (e) {
            this.handlePrismaWriteError(e, dto.slug);
            throw e;
        }
    }
    async update(id, dto) {
        const post = await this.prisma.post.findUnique({ where: { id } });
        if (!post)
            throw new common_1.NotFoundException('Bài viết không tồn tại');
        try {
            return await this.prisma.post.update({ where: { id }, data: dto });
        }
        catch (e) {
            this.handlePrismaWriteError(e, dto.slug);
            throw e;
        }
    }
    handlePrismaWriteError(e, slug) {
        if (e instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
                const target = e.meta?.target ?? '';
                const targetStr = Array.isArray(target) ? target.join(',') : String(target);
                if (targetStr.includes('slug')) {
                    throw new common_1.ConflictException(slug
                        ? `Slug "${slug}" đã tồn tại. Vui lòng chọn slug khác (ví dụ thêm tên tỉnh).`
                        : 'Slug đã tồn tại. Vui lòng chọn slug khác.');
                }
                throw new common_1.ConflictException('Bản ghi đã tồn tại (vi phạm ràng buộc duy nhất).');
            }
            if (e.code === 'P2003') {
                throw new common_1.ConflictException('Tham chiếu không hợp lệ (categoryId hoặc cityId không tồn tại).');
            }
        }
    }
    async remove(id) {
        const post = await this.prisma.post.findUnique({ where: { id } });
        if (!post)
            throw new common_1.NotFoundException('Bài viết không tồn tại');
        return this.prisma.post.delete({ where: { id } });
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PostsService);
//# sourceMappingURL=posts.service.js.map