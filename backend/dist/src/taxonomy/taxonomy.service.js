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
exports.TaxonomyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TaxonomyService = class TaxonomyService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async resolve(slugs) {
        if (!slugs.length)
            return { kind: 'not_found' };
        const first = slugs[0];
        const city = await this.prisma.city.findUnique({
            where: { slug: first },
            select: { id: true, name: true, slug: true },
        });
        const rest = city ? slugs.slice(1) : slugs.slice(0);
        if (city && rest.length === 0) {
            return { kind: 'city', city };
        }
        const chain = [];
        let parentId = null;
        let lastCategory = null;
        for (let i = 0; i < rest.length; i++) {
            const slug = rest[i];
            let cat = await this.prisma.category.findFirst({
                where: {
                    slug,
                    parentId,
                    ...(city ? { OR: [{ cityId: null }, { cityId: city.id }] } : {}),
                },
                select: { id: true, name: true, slug: true, type: true, parentId: true, cityId: true },
            });
            if (!cat && i === 0) {
                cat = await this.prisma.category.findFirst({
                    where: {
                        slug,
                        ...(city ? { OR: [{ cityId: null }, { cityId: city.id }] } : {}),
                    },
                    select: { id: true, name: true, slug: true, type: true, parentId: true, cityId: true },
                });
            }
            if (!cat)
                break;
            chain.push(cat);
            lastCategory = cat;
            parentId = cat.id;
        }
        const consumedCategories = chain.length;
        const remainingAfterCategories = rest.slice(consumedCategories);
        if (remainingAfterCategories.length === 0 && lastCategory) {
            return { kind: 'category', city: city ?? null, category: lastCategory, chain };
        }
        if (remainingAfterCategories.length === 1) {
            const postSlug = remainingAfterCategories[0];
            const post = await this.prisma.post.findUnique({
                where: { slug: postSlug },
                include: {
                    city: { select: { id: true, name: true, slug: true } },
                    category: { select: { id: true, name: true, slug: true, type: true, parentId: true, cityId: true } },
                },
            });
            if (!post || !post.published)
                return { kind: 'not_found' };
            if (city && post.cityId && post.cityId !== city.id)
                return { kind: 'not_found' };
            if (lastCategory && post.categoryId && post.categoryId !== lastCategory.id)
                return { kind: 'not_found' };
            return { kind: 'post', city: city ?? null, category: lastCategory, chain, post };
        }
        return { kind: 'not_found' };
    }
};
exports.TaxonomyService = TaxonomyService;
exports.TaxonomyService = TaxonomyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TaxonomyService);
//# sourceMappingURL=taxonomy.service.js.map