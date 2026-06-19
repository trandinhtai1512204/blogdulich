/**
 * Compute the canonical article URL for a post — strictly per sitemap v2.
 *
 * URL conventions (byte-for-byte, no infer, no normalize):
 *
 *   destination:  /diem-den/{city.slug}/{sub.slug}/{post.slug}
 *                 e.g., /diem-den/ha-noi/bao-tang/lang-bac
 *
 *   itinerary:    /lich-trinh/{city.slug}/{post.slug}
 *                 e.g., /lich-trinh/ha-noi/3-ngay-2-dem
 *
 *   experience:   /kinh-nghiem/{city.slug}/{post.slug}
 *                 e.g., /kinh-nghiem/ha-noi/thang-10
 *
 *   review:
 *                 /review/{subtype-public-slug}/{city.slug}/{post.slug}
 *
 * Logic: walk category chain leaf→root, reverse to root-first, drop the
 * Category slugs remain internal data keys. Public URLs follow the client
 * final brief and map those internal keys to shorter path segments.
 *
 * No-category fallback: /posts/{post.slug}
 */

const SYSTEM_ROOT_SLUGS = new Set([
  'diem-den',
  'lich-trinh-du-lich',
  'kinh-nghiem',
  'review',
]);

type CatNode = {
  id: string;
  slug: string;
  type?: string | null;
  level?: string | null;
  parentId: string | null;
  cityId?: string | null;
  parent?: CatNode | null;
};

type PostInput = {
  slug: string;
  category?: CatNode | null;
};

export function computePostCanonicalPath(post: PostInput): string {
  const cat = post.category ?? null;
  if (!cat) return `/posts/${post.slug}`;

  // Walk leaf → root
  const chain: CatNode[] = [cat];
  let cur: CatNode | null | undefined = cat.parent;
  while (cur) {
    chain.push(cur);
    cur = cur.parent;
  }
  // Reverse to root → leaf
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

  // Drop any known system root fallback if present.
  if (chain[0] && SYSTEM_ROOT_SLUGS.has(chain[0].slug)) chain.shift();

  if (chain.length === 0) return `/posts/${post.slug}`;

  return `/${chain.map((c) => c.slug).join('/')}/${post.slug}`;
}

function publicReviewSubtypeSlug(slug: string) {
  return slug.replace(/^review-/, '');
}

/**
 * Prisma select fragment to load a category with up to 3 ancestor levels
 * (4 cats total: cat → parent → parent → parent — deep enough for the
 * deepest URL pattern review-tour: cat=sub, parents = city, subtype, root).
 */
export const CATEGORY_WITH_ANCESTORS_SELECT = {
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
} as const;
