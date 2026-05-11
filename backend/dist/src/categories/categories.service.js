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
    { name: 'Điểm đến hấp dẫn', slug: 'diem-den', type: 'destination' },
    { name: 'Lịch trình du lịch', slug: 'lich-trinh-du-lich', type: 'itinerary' },
    { name: 'Review', slug: 'review', type: 'review' },
    { name: 'Kinh nghiệm du lịch', slug: 'kinh-nghiem', type: 'experience' },
];
const REVIEW_SUBTYPES_WITH_SUB = new Set(['review-tour', 'review-khach-san']);
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        try {
            await this.ensureSystemRoots();
        }
        catch (e) {
            console.error('[CategoriesService] ensureSystemRoots failed on init:', e);
        }
    }
    async ensureSystemRoots() {
        await Promise.all(SYSTEM_ROOTS.map(async (root) => {
            const existing = await this.prisma.category.findFirst({
                where: { slug: root.slug, parentId: null },
            });
            const data = {
                name: root.name,
                type: root.type,
                level: 'ROOT',
                parentId: null,
                cityId: null,
            };
            if (existing) {
                await this.prisma.category.update({ where: { id: existing.id }, data });
            }
            else {
                await this.prisma.category.create({ data: { ...data, slug: root.slug } });
            }
        }));
    }
    async walkParentChain(categoryId) {
        const select = {
            id: true, name: true, slug: true, type: true, level: true, parentId: true,
        };
        const chain = [];
        const first = await this.prisma.category.findUnique({ where: { id: categoryId }, select });
        if (!first)
            throw new common_1.NotFoundException('Chuyên mục cha không tồn tại');
        chain.push(first);
        let parentId = first.parentId;
        while (parentId) {
            const parent = await this.prisma.category.findUnique({
                where: { id: parentId }, select,
            });
            if (!parent)
                break;
            chain.push(parent);
            parentId = parent.parentId;
        }
        return chain;
    }
    computeChildLevel(parent, childSlug) {
        if (parent.level === 'SUB') {
            throw new common_1.BadRequestException('Sitemap chỉ cho phép tối đa 4 cấp — không thể tạo cấp con dưới SUB');
        }
        if (parent.level === 'ROOT') {
            if (parent.slug === 'review' && childSlug.startsWith('review-'))
                return 'SUBTYPE';
            return 'CITY';
        }
        if (parent.level === 'SUBTYPE')
            return 'CITY';
        return 'SUB';
    }
    validateChildLevelByModule(level, parentChain) {
        if (level !== 'SUB')
            return;
        const root = parentChain[parentChain.length - 1];
        if (!root || root.level !== 'ROOT') {
            throw new common_1.BadRequestException('Không tìm thấy gốc taxonomy của chuyên mục cha');
        }
        if (root.slug === 'lich-trinh-du-lich') {
            throw new common_1.BadRequestException('Module Lịch trình không có sub-tiểu-mục — bài viết gắn trực tiếp vào tỉnh thành.');
        }
        if (root.slug === 'kinh-nghiem') {
            throw new common_1.BadRequestException('Module Kinh nghiệm không có sub-tiểu-mục — bài viết gắn trực tiếp vào tỉnh thành.');
        }
        if (root.slug === 'review') {
            const subtype = parentChain.find((c) => c.level === 'SUBTYPE');
            if (!subtype) {
                throw new common_1.BadRequestException('SUB của Review phải nằm dưới một SUBTYPE');
            }
            if (!REVIEW_SUBTYPES_WITH_SUB.has(subtype.slug)) {
                throw new common_1.BadRequestException(`Mục "${subtype.name}" theo sitemap không có chuyên mục con. Bài viết Combo/Resort/Du thuyền/Nhà hàng gắn trực tiếp vào "Thành phố".`);
            }
        }
    }
    isSystemRootSlug(slug) {
        return SYSTEM_ROOTS.some((root) => root.slug === slug);
    }
    async findAll(query) {
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
                level: true,
                cityId: true,
                parentId: true,
                createdAt: true,
            },
        });
    }
    async findOne(slug) {
        const cat = await this.prisma.category.findFirst({
            where: { slug },
            include: { parent: true, children: true, city: true },
        });
        if (!cat)
            throw new common_1.NotFoundException('Chuyên mục không tồn tại');
        return cat;
    }
    async create(dto) {
        if (!dto.parentId) {
            throw new common_1.BadRequestException('Chỉ cho phép tạo chuyên mục bên dưới danh mục trụ cột');
        }
        if (this.isSystemRootSlug(dto.slug)) {
            throw new common_1.BadRequestException('Slug này thuộc danh mục trụ cột hệ thống, vui lòng dùng slug khác');
        }
        const parentChain = await this.walkParentChain(dto.parentId);
        const parent = parentChain[0];
        const root = parentChain[parentChain.length - 1];
        const level = this.computeChildLevel(parent, dto.slug);
        this.validateChildLevelByModule(level, parentChain);
        try {
            return await this.prisma.category.create({
                data: {
                    ...dto,
                    type: root.type,
                    level,
                },
            });
        }
        catch (e) {
            if (e?.code === 'P2002' && e?.meta?.target?.includes('slug')) {
                throw new common_1.BadRequestException(`Slug "${dto.slug}" đã tồn tại dưới chuyên mục cha này. Hãy đổi slug khác.`);
            }
            throw e;
        }
    }
    async update(id, dto) {
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
        const data = { ...dto };
        const targetParentId = dto.parentId === undefined ? cat.parentId : dto.parentId;
        if (targetParentId) {
            const parentChain = await this.walkParentChain(targetParentId);
            const parent = parentChain[0];
            const root = parentChain[parentChain.length - 1];
            const level = this.computeChildLevel(parent, dto.slug ?? cat.slug);
            this.validateChildLevelByModule(level, parentChain);
            data.type = root.type;
            data.level = level;
        }
        return this.prisma.category.update({ where: { id }, data });
    }
    async remove(id) {
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
            throw new common_1.BadRequestException('Không thể xoá: chuyên mục đang có mục con');
        }
        if (postsCount > 0) {
            throw new common_1.BadRequestException('Không thể xoá: chuyên mục đang có bài viết');
        }
        return this.prisma.category.delete({ where: { id } });
    }
    async bootstrapRoots() {
        await this.ensureSystemRoots();
        return this.prisma.category.findMany({
            where: { parentId: null, slug: { in: SYSTEM_ROOTS.map((x) => x.slug) } },
            orderBy: { createdAt: 'asc' },
            select: { id: true, name: true, slug: true, type: true, level: true, parentId: true, cityId: true, createdAt: true },
        });
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map