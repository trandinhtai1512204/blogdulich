/**
 * Compute the canonical article URL for a post — strictly per sitemap v2.
 *
 * URL conventions (byte-for-byte, no infer, no normalize):
 *
 *   destination:  /{city.slug}/{sub.slug}/{post.slug}
 *                 e.g., /ha-noi/bao-tang/lang-bac
 *
 *   itinerary:    /{city-landing.slug}/{post.slug}
 *                 e.g., /lich-trinh-du-lich-ha-noi/3-ngay-2-dem
 *
 *   experience:   /{city-landing.slug}/{post.slug}
 *                 e.g., /kinh-nghiem-du-lich-ha-noi/thang-10
 *
 *   review-tour, review-khach-san:
 *                 /{subtype.slug}/{city.slug}/{sub.slug}/{post.slug}
 *
 *   review-combo, review-resort, review-du-thuyen, review-nha-hang:
 *                 /{subtype.slug}/{city.slug}/{post.slug}
 *
 * Logic: walk category chain leaf→root, reverse to root-first, drop the
 * system root (its slug never appears in URL — `diem-den` is internal display
 * only; the other 3 roots ARE valid URL segments only as the root index page,
 * never as a parent prefix in nested URLs since itinerary/experience/review
 * use flat slug patterns at the city/subtype level).
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
  parentId: string | null;
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

  // Drop the system root if present (never in URL).
  if (chain[0] && SYSTEM_ROOT_SLUGS.has(chain[0].slug)) chain.shift();

  if (chain.length === 0) return `/posts/${post.slug}`;

  return `/${chain.map((c) => c.slug).join('/')}/${post.slug}`;
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
