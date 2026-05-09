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
const post_canonical_1 = require("../posts/post-canonical");
const CAT_SELECT = {
    id: true,
    name: true,
    slug: true,
    type: true,
    level: true,
    parentId: true,
    cityId: true,
};
const REVIEW_HAS_SUB = new Set(['review-tour', 'review-khach-san']);
let TaxonomyService = class TaxonomyService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async resolve(slugs) {
        if (!slugs.length)
            return { kind: 'not_found' };
        const canonicalPath = '/' + slugs.join('/');
        const first = slugs[0];
        if (first === 'lich-trinh-du-lich' || first === 'kinh-nghiem' || first === 'review') {
            return this.resolveModuleRoot(first, slugs.slice(1), canonicalPath);
        }
        if (first.startsWith('lich-trinh-du-lich-')) {
            return this.resolveFlatCityVertical('lich-trinh-du-lich', first, slugs.slice(1), canonicalPath);
        }
        if (first.startsWith('kinh-nghiem-du-lich-')) {
            return this.resolveFlatCityVertical('kinh-nghiem', first, slugs.slice(1), canonicalPath);
        }
        if (first.startsWith('review-')) {
            return this.resolveReview(first, slugs.slice(1), canonicalPath);
        }
        return this.resolveDestination(slugs, canonicalPath);
    }
    async resolveModuleRoot(rootSlug, rest, canonicalPath) {
        if (rest.length > 0)
            return { kind: 'not_found' };
        const root = await this.prisma.category.findFirst({
            where: { slug: rootSlug, parentId: null, level: 'ROOT' },
            select: CAT_SELECT,
        });
        if (!root)
            return { kind: 'not_found' };
        return {
            kind: 'category',
            city: null,
            category: root,
            chain: [root],
            canonicalPath,
        };
    }
    async resolveFlatCityVertical(rootSlug, citySlug, rest, canonicalPath) {
        const root = await this.prisma.category.findFirst({
            where: { slug: rootSlug, parentId: null, level: 'ROOT' },
            select: CAT_SELECT,
        });
        if (!root)
            return { kind: 'not_found' };
        const cityCat = await this.prisma.category.findFirst({
            where: { slug: citySlug, parentId: root.id, level: 'CITY' },
            select: CAT_SELECT,
        });
        if (!cityCat)
            return { kind: 'not_found' };
        const city = await this.loadCity(cityCat.cityId);
        if (rest.length === 0) {
            return {
                kind: 'category',
                city,
                category: cityCat,
                chain: [cityCat],
                canonicalPath,
            };
        }
        if (rest.length === 1) {
            const post = await this.loadPost(rest[0], cityCat.id);
            if (!post || post.categoryId !== cityCat.id)
                return { kind: 'not_found' };
            return {
                kind: 'post',
                city,
                category: cityCat,
                chain: [cityCat],
                post,
                canonicalPath: (0, post_canonical_1.computePostCanonicalPath)(post),
            };
        }
        return { kind: 'not_found' };
    }
    async resolveReview(subtypeSlug, rest, canonicalPath) {
        const reviewRoot = await this.prisma.category.findFirst({
            where: { slug: 'review', parentId: null, level: 'ROOT' },
            select: CAT_SELECT,
        });
        if (!reviewRoot)
            return { kind: 'not_found' };
        const subtype = await this.prisma.category.findFirst({
            where: { slug: subtypeSlug, parentId: reviewRoot.id, level: 'SUBTYPE' },
            select: CAT_SELECT,
        });
        if (!subtype)
            return { kind: 'not_found' };
        if (rest.length === 0) {
            return {
                kind: 'category',
                city: null,
                category: subtype,
                chain: [subtype],
                canonicalPath,
            };
        }
        const cityCat = await this.prisma.category.findFirst({
            where: { slug: rest[0], parentId: subtype.id, level: 'CITY' },
            select: CAT_SELECT,
        });
        if (!cityCat)
            return { kind: 'not_found' };
        const city = await this.loadCity(cityCat.cityId);
        if (rest.length === 1) {
            return {
                kind: 'category',
                city,
                category: cityCat,
                chain: [subtype],
                canonicalPath,
            };
        }
        if (REVIEW_HAS_SUB.has(subtypeSlug)) {
            const subCat = await this.prisma.category.findFirst({
                where: { slug: rest[1], parentId: cityCat.id, level: 'SUB' },
                select: CAT_SELECT,
            });
            if (!subCat)
                return { kind: 'not_found' };
            if (rest.length === 2) {
                return {
                    kind: 'category',
                    city,
                    category: subCat,
                    chain: [subtype, subCat],
                    canonicalPath,
                };
            }
            if (rest.length === 3) {
                const post = await this.loadPost(rest[2], subCat.id);
                if (!post || post.categoryId !== subCat.id)
                    return { kind: 'not_found' };
                return {
                    kind: 'post',
                    city,
                    category: subCat,
                    chain: [subtype, subCat],
                    post,
                    canonicalPath: (0, post_canonical_1.computePostCanonicalPath)(post),
                };
            }
            return { kind: 'not_found' };
        }
        if (rest.length !== 2)
            return { kind: 'not_found' };
        const post = await this.loadPost(rest[1], cityCat.id);
        if (!post || post.categoryId !== cityCat.id)
            return { kind: 'not_found' };
        return {
            kind: 'post',
            city,
            category: cityCat,
            chain: [subtype],
            post,
            canonicalPath: (0, post_canonical_1.computePostCanonicalPath)(post),
        };
    }
    async resolveDestination(slugs, canonicalPath) {
        const citySlug = slugs[0];
        const city = await this.prisma.city.findUnique({
            where: { slug: citySlug },
            select: { id: true, name: true, slug: true },
        });
        if (!city)
            return { kind: 'not_found' };
        if (slugs.length === 1)
            return { kind: 'city', city, canonicalPath };
        const destRoot = await this.prisma.category.findFirst({
            where: { slug: 'diem-den', parentId: null, level: 'ROOT' },
            select: CAT_SELECT,
        });
        if (!destRoot)
            return { kind: 'not_found' };
        const cityCat = await this.prisma.category.findFirst({
            where: { slug: citySlug, parentId: destRoot.id, level: 'CITY' },
            select: CAT_SELECT,
        });
        if (!cityCat)
            return { kind: 'not_found' };
        if (slugs.length === 2) {
            const subCat = await this.prisma.category.findFirst({
                where: { slug: slugs[1], parentId: cityCat.id, level: 'SUB' },
                select: CAT_SELECT,
            });
            if (!subCat)
                return { kind: 'not_found' };
            return {
                kind: 'category',
                city,
                category: subCat,
                chain: [subCat],
                canonicalPath,
            };
        }
        if (slugs.length === 3) {
            const subCat = await this.prisma.category.findFirst({
                where: { slug: slugs[1], parentId: cityCat.id, level: 'SUB' },
                select: CAT_SELECT,
            });
            if (!subCat)
                return { kind: 'not_found' };
            const post = await this.loadPost(slugs[2], subCat.id);
            if (!post || post.categoryId !== subCat.id)
                return { kind: 'not_found' };
            return {
                kind: 'post',
                city,
                category: subCat,
                chain: [subCat],
                post,
                canonicalPath: (0, post_canonical_1.computePostCanonicalPath)(post),
            };
        }
        return { kind: 'not_found' };
    }
    async loadCity(cityId) {
        if (!cityId)
            return null;
        const city = await this.prisma.city.findUnique({
            where: { id: cityId },
            select: { id: true, name: true, slug: true },
        });
        return city ?? null;
    }
    async loadPost(slug, categoryId) {
        const post = await this.prisma.post.findFirst({
            where: { slug, categoryId },
            include: {
                city: { select: { id: true, name: true, slug: true } },
                category: { select: post_canonical_1.CATEGORY_WITH_ANCESTORS_SELECT },
            },
        });
        if (!post || !post.published)
            return null;
        return post;
    }
};
exports.TaxonomyService = TaxonomyService;
exports.TaxonomyService = TaxonomyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TaxonomyService);
//# sourceMappingURL=taxonomy.service.js.map