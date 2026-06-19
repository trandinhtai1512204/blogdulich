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
const REVIEW_SUBTYPE_SLUGS = new Set([
    'review-tour',
    'review-khach-san',
    'review-combo',
    'review-resort',
    'review-du-thuyen',
    'review-nha-hang',
]);
const REVIEW_PUBLIC_TO_INTERNAL = {
    tour: 'review-tour',
    'khach-san': 'review-khach-san',
    combo: 'review-combo',
    resort: 'review-resort',
    'du-thuyen': 'review-du-thuyen',
    'nha-hang': 'review-nha-hang',
};
const POST_LIST_SELECT = {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    thumbnail: true,
    createdAt: true,
    cityId: true,
    categoryId: true,
    city: { select: { id: true, name: true, slug: true } },
    category: { select: post_canonical_1.CATEGORY_WITH_ANCESTORS_SELECT },
};
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
        if (first === 'diem-den') {
            if (slugs.length === 1) {
                return this.resolveModuleRoot('diem-den', [], canonicalPath);
            }
            return this.resolveDestination(slugs.slice(1), canonicalPath);
        }
        if (first === 'lich-trinh') {
            if (slugs.length === 1) {
                return this.resolveModuleRoot('lich-trinh-du-lich', [], canonicalPath);
            }
            return this.resolveNestedCityVertical('lich-trinh-du-lich', 'lich-trinh-du-lich', slugs[1], slugs.slice(2), canonicalPath);
        }
        if (first === 'kinh-nghiem') {
            if (slugs.length === 1) {
                return this.resolveModuleRoot('kinh-nghiem', [], canonicalPath);
            }
            return this.resolveNestedCityVertical('kinh-nghiem', 'kinh-nghiem-du-lich', slugs[1], slugs.slice(2), canonicalPath);
        }
        if (first === 'review') {
            if (slugs.length === 1) {
                return this.resolveModuleRoot('review', [], canonicalPath);
            }
            const subtypeSlug = REVIEW_PUBLIC_TO_INTERNAL[slugs[1]];
            if (!subtypeSlug)
                return { kind: 'not_found' };
            return this.resolveReview(subtypeSlug, slugs.slice(2), canonicalPath);
        }
        return { kind: 'not_found' };
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
    async resolveNestedCityVertical(rootSlug, citySlugPrefix, citySlug, rest, canonicalPath) {
        const root = await this.prisma.category.findFirst({
            where: { slug: rootSlug, parentId: null, level: 'ROOT' },
            select: CAT_SELECT,
        });
        if (!root)
            return { kind: 'not_found' };
        const cityCat = await this.prisma.category.findFirst({
            where: {
                slug: `${citySlugPrefix}-${citySlug}`,
                parentId: root.id,
                level: 'CITY',
            },
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
        return this.resolveCityMixedNode(cityCat, city, rest, [cityCat], canonicalPath);
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
        return this.resolveCityMixedNode(cityCat, city, rest.slice(1), [subtype], canonicalPath);
    }
    async resolveCityMixedNode(cityCat, city, rest, parentChain, canonicalPath) {
        if (rest.length === 1) {
            const subCat = await this.prisma.category.findFirst({
                where: { slug: rest[0], parentId: cityCat.id, level: 'SUB' },
                select: CAT_SELECT,
            });
            if (subCat) {
                return {
                    kind: 'category',
                    city,
                    category: subCat,
                    chain: [...parentChain, subCat],
                    canonicalPath,
                };
            }
            const post = await this.loadPost(rest[0], cityCat.id);
            if (!post || post.categoryId !== cityCat.id)
                return { kind: 'not_found' };
            return {
                kind: 'post',
                city,
                category: cityCat,
                chain: parentChain,
                post,
                canonicalPath: (0, post_canonical_1.computePostCanonicalPath)(post),
            };
        }
        if (rest.length === 2) {
            const subCat = await this.prisma.category.findFirst({
                where: { slug: rest[0], parentId: cityCat.id, level: 'SUB' },
                select: CAT_SELECT,
            });
            if (!subCat)
                return { kind: 'not_found' };
            const post = await this.loadPost(rest[1], subCat.id);
            if (!post || post.categoryId !== subCat.id)
                return { kind: 'not_found' };
            return {
                kind: 'post',
                city,
                category: subCat,
                chain: [...parentChain, subCat],
                post,
                canonicalPath: (0, post_canonical_1.computePostCanonicalPath)(post),
            };
        }
        return { kind: 'not_found' };
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
            if (subCat) {
                return {
                    kind: 'category',
                    city,
                    category: subCat,
                    chain: [subCat],
                    canonicalPath,
                };
            }
            const post = await this.loadPost(slugs[1], cityCat.id);
            if (!post)
                return { kind: 'not_found' };
            return {
                kind: 'post',
                city,
                category: cityCat,
                chain: [],
                post,
                canonicalPath: (0, post_canonical_1.computePostCanonicalPath)(post),
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
    async resolvePage(slugs) {
        const resolved = await this.resolve(slugs);
        if (resolved.kind === 'not_found' || resolved.kind === 'post') {
            return { resolved, children: [], cityPills: [], posts: [] };
        }
        if (resolved.kind === 'city') {
            const navCats = await this.prisma.category.findMany({
                where: { cityId: resolved.city.id, type: 'destination' },
                select: CAT_SELECT,
                orderBy: { createdAt: 'asc' },
            });
            const destCatIds = navCats.map((c) => c.id);
            const rawPosts = destCatIds.length
                ? await this.prisma.post.findMany({
                    where: {
                        published: true,
                        cityId: resolved.city.id,
                        categoryId: { in: destCatIds },
                    },
                    take: 12,
                    orderBy: { createdAt: 'desc' },
                    select: POST_LIST_SELECT,
                })
                : [];
            const posts = rawPosts.map((p) => ({
                ...p,
                canonicalUrl: (0, post_canonical_1.computePostCanonicalPath)(p),
            }));
            return { resolved, children: navCats, cityPills: [], posts };
        }
        const catId = resolved.category.id;
        const cityId = resolved.city?.id ?? null;
        const citySlug = resolved.city?.slug ?? null;
        const isReviewSubtypeL2 = REVIEW_SUBTYPE_SLUGS.has(resolved.category.slug) && !resolved.city;
        if (isReviewSubtypeL2) {
            const [cities, rawPosts] = await Promise.all([
                this.prisma.city.findMany({
                    select: { id: true, name: true, slug: true },
                    orderBy: { createdAt: 'desc' },
                }),
                this.prisma.post.findMany({
                    where: { published: true, categoryId: catId },
                    take: 12,
                    orderBy: { createdAt: 'desc' },
                    select: POST_LIST_SELECT,
                }),
            ]);
            const posts = rawPosts.map((p) => ({
                ...p,
                canonicalUrl: (0, post_canonical_1.computePostCanonicalPath)(p),
            }));
            return { resolved, children: [], cityPills: cities, posts };
        }
        const postsWhere = { published: true, categoryId: catId };
        if (cityId)
            postsWhere.cityId = cityId;
        const [allChildren, rawPosts] = await Promise.all([
            this.prisma.category.findMany({
                where: { parentId: catId },
                select: CAT_SELECT,
                orderBy: { createdAt: 'asc' },
            }),
            this.prisma.post.findMany({
                where: postsWhere,
                take: 12,
                orderBy: { createdAt: 'desc' },
                select: POST_LIST_SELECT,
            }),
        ]);
        const filteredChildren = cityId
            ? allChildren.filter((c) => (c.cityId == null || c.cityId === cityId) && c.slug !== citySlug)
            : allChildren;
        const posts = rawPosts.map((p) => ({
            ...p,
            canonicalUrl: (0, post_canonical_1.computePostCanonicalPath)(p),
        }));
        return { resolved, children: filteredChildren, cityPills: [], posts };
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