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
    if (chain[0] && SYSTEM_ROOT_SLUGS.has(chain[0].slug))
        chain.shift();
    if (chain.length === 0)
        return `/posts/${post.slug}`;
    return `/${chain.map((c) => c.slug).join('/')}/${post.slug}`;
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