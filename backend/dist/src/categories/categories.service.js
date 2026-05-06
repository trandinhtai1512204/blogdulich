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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const SYSTEM_ROOTS = [
    { name: 'Giới thiệu', slug: 'about', type: 'about' },
    { name: 'Điểm đến hấp dẫn', slug: 'diem-den', type: 'destination' },
    { name: 'Lịch trình du lịch', slug: 'lich-trinh-du-lich', type: 'itinerary' },
    { name: 'Chi phí du lịch', slug: 'chi-phi-du-lich', type: 'cost' },
    { name: 'Review', slug: 'review', type: 'review' },
    { name: 'Kinh nghiệm du lịch', slug: 'kinh-nghiem', type: 'experience' },
];
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async ensureSystemRoots() {
        await Promise.all(SYSTEM_ROOTS.map((root) => this.prisma.category.upsert({
            where: { slug: root.slug },
            create: {
                name: root.name,
                slug: root.slug,
                type: root.type,
                parentId: null,
                cityId: null,
            },
            update: {
                name: root.name,
                type: root.type,
                parentId: null,
                cityId: null,
            },
        })));
    }
    async resolveRootType(categoryId) {
        const current = await this.prisma.category.findUnique({
            where: { id: categoryId },
            select: { id: true, type: true, parentId: true },
        });
        if (!current)
            throw new common_1.NotFoundException('Chuyên mục cha không tồn tại');
        let node = current;
        while (node.parentId) {
            const parent = await this.prisma.category.findUnique({
                where: { id: node.parentId },
                select: { id: true, type: true, parentId: true },
            });
            if (!parent)
                break;
            node = parent;
        }
        return node.type;
    }
    isSystemRootSlug(slug) {
        return SYSTEM_ROOTS.some((root) => root.slug === slug);
    }
    async findAll(query) {
        await this.ensureSystemRoots();
        const { type, cityId, parentId } = query;
        const where = {};
        if (type)
            where.type = type;
        if (cityId)
            where.cityId = cityId;
        if (parentId)
            where.parentId = parentId;
        return this.prisma.category.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                slug: true,
                type: true,
                cityId: true,
                parentId: true,
                createdAt: true,
            },
        });
    }
    async findOne(slug) {
        await this.ensureSystemRoots();
        const cat = await this.prisma.category.findUnique({
            where: { slug },
            include: { parent: true, children: true, city: true },
        });
        if (!cat)
            throw new common_1.NotFoundException('Chuyên mục không tồn tại');
        return cat;
    }
    async create(dto) {
        await this.ensureSystemRoots();
        if (!dto.parentId) {
            throw new common_1.BadRequestException('Chỉ cho phép tạo chuyên mục bên dưới danh mục trụ cột');
        }
        const type = await this.resolveRootType(dto.parentId);
        if (this.isSystemRootSlug(dto.slug)) {
            throw new common_1.BadRequestException('Slug này thuộc danh mục trụ cột hệ thống, vui lòng dùng slug khác');
        }
        return this.prisma.category.create({
            data: {
                ...dto,
                type,
            },
        });
    }
    async update(id, dto) {
        await this.ensureSystemRoots();
        const cat = await this.prisma.category.findUnique({ where: { id } });
        if (!cat)
            throw new common_1.NotFoundException('Chuyên mục không tồn tại');
        const isRoot = !cat.parentId && this.isSystemRootSlug(cat.slug);
        if (isRoot && dto.parentId !== undefined && dto.parentId !== null) {
            throw new common_1.BadRequestException('Không thể chuyển danh mục trụ cột thành mục con');
        }
        if (!isRoot && dto.parentId !== undefined && dto.parentId === null) {
            throw new common_1.BadRequestException('Không thể chuyển mục con thành danh mục gốc');
        }
        if (!isRoot && dto.slug && this.isSystemRootSlug(dto.slug)) {
            throw new common_1.BadRequestException('Slug này thuộc danh mục trụ cột hệ thống');
        }
        let type = dto.type;
        const targetParentId = dto.parentId === undefined ? cat.parentId : dto.parentId;
        if (targetParentId) {
            type = await this.resolveRootType(targetParentId);
        }
        return this.prisma.category.update({
            where: { id },
            data: { ...dto, type },
        });
    }
    async remove(id) {
        await this.ensureSystemRoots();
        const cat = await this.prisma.category.findUnique({ where: { id } });
        if (!cat)
            throw new common_1.NotFoundException('Chuyên mục không tồn tại');
        if (!cat.parentId && this.isSystemRootSlug(cat.slug)) {
            throw new common_1.BadRequestException('Không thể xoá danh mục trụ cột hệ thống');
        }
        const [childrenCount, postsCount] = await Promise.all([
            this.prisma.category.count({ where: { parentId: id } }),
            this.prisma.post.count({ where: { categoryId: id } }),
        ]);
        if (childrenCount > 0) {
            throw new common_1.NotFoundException('Không thể xoá: chuyên mục đang có mục con');
        }
        if (postsCount > 0) {
            throw new common_1.NotFoundException('Không thể xoá: chuyên mục đang có bài viết');
        }
        return this.prisma.category.delete({ where: { id } });
    }
    async bootstrapRoots() {
        await this.ensureSystemRoots();
        return this.prisma.category.findMany({
            where: { parentId: null, slug: { in: SYSTEM_ROOTS.map((x) => x.slug) } },
            orderBy: { createdAt: 'asc' },
            select: { id: true, name: true, slug: true, type: true, parentId: true, cityId: true, createdAt: true },
        });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map