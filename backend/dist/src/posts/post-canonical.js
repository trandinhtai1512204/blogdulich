"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CATEGORY_WITH_ANCESTORS_SELECT = void 0;
exports.computePostCanonicalPath = computePostCanonicalPath;
const SYSTEM_ROOT_SLUGS = new Set([
    'diem-den',
    'lich-trinh-du-lich',
    'kinh-nghiem',
    'review',
]);
function computePostCanonicalPath(post) {
    const cat = post.category ?? null;
    if (!cat)
        return `/posts/${post.slug}`;
    const chain = [cat];
    let cur = cat.parent;
    while (cur) {
        chain.push(cur);
        cur = cur.parent;
    }
    chain.reverse();
    const root = chain[0];
    if (root?.slug === 'diem-den') {
        return `/${['diem-den', ...chain.slice(1).map((c) => c.slug), post.slug].join('/')}`;
    }
    if (root?.slug === 'lich-trinh-du-lich') {
        const citySlug = chain[1]?.slug.replace(/^lich-trinh-du-lich-/, '');
        const rest = chain.slice(2).map((c) => c.slug);
        return citySlug
            ? `/${['lich-trinh', citySlug, ...rest, post.slug].join('/')}`
            : `/posts/${post.slug}`;
    }
    if (root?.slug === 'kinh-nghiem') {
        const citySlug = chain[1]?.slug.replace(/^kinh-nghiem-du-lich-/, '');
        const rest = chain.slice(2).map((c) => c.slug);
        return citySlug
            ? `/${['kinh-nghiem', citySlug, ...rest, post.slug].join('/')}`
            : `/posts/${post.slug}`;
    }
    if (root?.slug === 'review') {
        const [subtype, ...rest] = chain.slice(1);
        const subtypeSlug = subtype ? publicReviewSubtypeSlug(subtype.slug) : null;
        return subtypeSlug
            ? `/${['review', subtypeSlug, ...rest.map((c) => c.slug), post.slug].join('/')}`
            : `/posts/${post.slug}`;
    }
    if (chain[0] && SYSTEM_ROOT_SLUGS.has(chain[0].slug))
        chain.shift();
    if (chain.length === 0)
        return `/posts/${post.slug}`;
    return `/${chain.map((c) => c.slug).join('/')}/${post.slug}`;
}
function publicReviewSubtypeSlug(slug) {
    return slug.replace(/^review-/, '');
}
exports.CATEGORY_WITH_ANCESTORS_SELECT = {
    id: true,
    name: true,
    slug: true,
    type: true,
    level: true,
    parentId: true,
    cityId: true,
    parent: {
        select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            level: true,
            parentId: true,
            cityId: true,
            parent: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    type: true,
                    level: true,
                    parentId: true,
                    cityId: true,
                    parent: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            type: true,
                            level: true,
                            parentId: true,
                            cityId: true,
                        },
                    },
                },
            },
        },
    },
};
//# sourceMappingURL=post-canonical.js.map