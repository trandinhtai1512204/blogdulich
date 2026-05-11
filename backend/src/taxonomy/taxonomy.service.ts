import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CATEGORY_WITH_ANCESTORS_SELECT, computePostCanonicalPath } from '../posts/post-canonical';

type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  type: string;
  level: 'ROOT' | 'SUBTYPE' | 'CITY' | 'SUB';
  parentId: string | null;
  cityId: string | null;
};
type CityNode = { id: string; name: string; slug: string };

type ResolveResult =
  | { kind: 'city'; city: CityNode; canonicalPath: string }
  | { kind: 'category'; city: CityNode | null; category: CategoryNode; chain: CategoryNode[]; canonicalPath: string }
  | { kind: 'post'; city: CityNode | null; category: CategoryNode | null; chain: CategoryNode[]; post: any; canonicalPath: string }
  | { kind: 'not_found' };

const CAT_SELECT = {
  id: true,
  name: true,
  slug: true,
  type: true,
  level: true,
  parentId: true,
  cityId: true,
} as const;

const REVIEW_HAS_SUB = new Set(['review-tour', 'review-khach-san']);

const REVIEW_SUBTYPE_SLUGS = new Set([
  'review-tour', 'review-khach-san', 'review-combo',
  'review-resort', 'review-du-thuyen', 'review-nha-hang',
]);

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
  category: { select: CATEGORY_WITH_ANCESTORS_SELECT },
} as const;

@Injectable()
export class TaxonomyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Resolve a URL path to: city / category / post / not_found.
   *
   * Strict per-module dispatch — sitemap v2 is the source of truth, no infer,
   * no fallbacks. Each module has its own depth and slug-prefix rules.
   *
   *   /lich-trinh-du-lich                 → itinerary ROOT index
   *   /lich-trinh-du-lich-{city}          → itinerary CITY landing
   *   /lich-trinh-du-lich-{city}/{post}   → itinerary post
   *
   *   /kinh-nghiem                        → experience ROOT index
   *   /kinh-nghiem-du-lich-{city}         → experience CITY landing
   *   /kinh-nghiem-du-lich-{city}/{post}  → experience post
   *
   *   /review                             → review ROOT index
   *   /review-{subtype}                   → review SUBTYPE listing
   *   /review-{subtype}/{city}            → review CITY listing
   *   /review-{subtype}/{city}/{sub}      → review SUB listing  (tour, khach-san)
   *   /review-{subtype}/{city}/{sub}/{p}  → review post         (tour, khach-san)
   *   /review-{subtype}/{city}/{post}     → review post         (combo, resort, du-thuyen, nha-hang)
   *
   *   /{city}                             → destination CITY (a City record)
   *   /{city}/{sub}                       → destination SUB listing
   *   /{city}/{sub}/{post}                → destination post
   *
   * Note: `diem-den` ROOT slug is INTERNAL ONLY — never appears in URL.
   */
  async resolve(slugs: string[]): Promise<ResolveResult> {
    if (!slugs.length) return { kind: 'not_found' };
    const canonicalPath = '/' + slugs.join('/');
    const first = slugs[0];

    // Module ROOT index pages (3 of 4 — diem-den is not URL-accessible).
    if (first === 'lich-trinh-du-lich' || first === 'kinh-nghiem' || first === 'review') {
      return this.resolveModuleRoot(first, slugs.slice(1), canonicalPath);
    }

    // Itinerary city landing — flat slug `lich-trinh-du-lich-{city}`.
    if (first.startsWith('lich-trinh-du-lich-')) {
      return this.resolveFlatCityVertical('lich-trinh-du-lich', first, slugs.slice(1), canonicalPath);
    }

    // Experience city landing — flat slug `kinh-nghiem-du-lich-{city}`.
    if (first.startsWith('kinh-nghiem-du-lich-')) {
      return this.resolveFlatCityVertical('kinh-nghiem', first, slugs.slice(1), canonicalPath);
    }

    // Review subtype tree.
    if (first.startsWith('review-')) {
      return this.resolveReview(first, slugs.slice(1), canonicalPath);
    }

    // Default: destination tree, first slug = city slug.
    return this.resolveDestination(slugs, canonicalPath);
  }

  // -------- Module ROOT index --------------------------------------------
  private async resolveModuleRoot(
    rootSlug: string,
    rest: string[],
    canonicalPath: string,
  ): Promise<ResolveResult> {
    if (rest.length > 0) return { kind: 'not_found' };
    const root = await this.prisma.category.findFirst({
      where: { slug: rootSlug, parentId: null, level: 'ROOT' },
      select: CAT_SELECT,
    });
    if (!root) return { kind: 'not_found' };
    return {
      kind: 'category',
      city: null,
      category: root as CategoryNode,
      chain: [root as CategoryNode],
      canonicalPath,
    };
  }

  // -------- Itinerary / Experience: flat city + optional post -----------
  private async resolveFlatCityVertical(
    rootSlug: string,
    citySlug: string,
    rest: string[],
    canonicalPath: string,
  ): Promise<ResolveResult> {
    const root = await this.prisma.category.findFirst({
      where: { slug: rootSlug, parentId: null, level: 'ROOT' },
      select: CAT_SELECT,
    });
    if (!root) return { kind: 'not_found' };

    const cityCat = await this.prisma.category.findFirst({
      where: { slug: citySlug, parentId: root.id, level: 'CITY' },
      select: CAT_SELECT,
    });
    if (!cityCat) return { kind: 'not_found' };

    const city = await this.loadCity(cityCat.cityId);

    if (rest.length === 0) {
      return {
        kind: 'category',
        city,
        category: cityCat as CategoryNode,
        chain: [cityCat as CategoryNode],
        canonicalPath,
      };
    }
    if (rest.length === 1) {
      const post = await this.loadPost(rest[0], cityCat.id);
      if (!post || post.categoryId !== cityCat.id) return { kind: 'not_found' };
      return {
        kind: 'post',
        city,
        category: cityCat as CategoryNode,
        chain: [cityCat as CategoryNode],
        post,
        canonicalPath: computePostCanonicalPath(post as any),
      };
    }
    return { kind: 'not_found' };
  }

  // -------- Review tree -------------------------------------------------
  private async resolveReview(
    subtypeSlug: string,
    rest: string[],
    canonicalPath: string,
  ): Promise<ResolveResult> {
    const reviewRoot = await this.prisma.category.findFirst({
      where: { slug: 'review', parentId: null, level: 'ROOT' },
      select: CAT_SELECT,
    });
    if (!reviewRoot) return { kind: 'not_found' };

    const subtype = await this.prisma.category.findFirst({
      where: { slug: subtypeSlug, parentId: reviewRoot.id, level: 'SUBTYPE' },
      select: CAT_SELECT,
    });
    if (!subtype) return { kind: 'not_found' };

    if (rest.length === 0) {
      return {
        kind: 'category',
        city: null,
        category: subtype as CategoryNode,
        chain: [subtype as CategoryNode],
        canonicalPath,
      };
    }

    // rest[0] = city slug (Category, level=CITY, parent=subtype)
    const cityCat = await this.prisma.category.findFirst({
      where: { slug: rest[0], parentId: subtype.id, level: 'CITY' },
      select: CAT_SELECT,
    });
    if (!cityCat) return { kind: 'not_found' };
    const city = await this.loadCity(cityCat.cityId);

    if (rest.length === 1) {
      // City listing under subtype. Chain omits cityCat — its slug == city.slug
      // and the breadcrumb walker uses the city object for that segment.
      return {
        kind: 'category',
        city,
        category: cityCat as CategoryNode,
        chain: [subtype as CategoryNode],
        canonicalPath,
      };
    }

    if (REVIEW_HAS_SUB.has(subtypeSlug)) {
      // rest[1] = sub category, rest[2] = post (optional)
      const subCat = await this.prisma.category.findFirst({
        where: { slug: rest[1], parentId: cityCat.id, level: 'SUB' },
        select: CAT_SELECT,
      });
      if (!subCat) return { kind: 'not_found' };

      if (rest.length === 2) {
        return {
          kind: 'category',
          city,
          category: subCat as CategoryNode,
          chain: [subtype as CategoryNode, subCat as CategoryNode],
          canonicalPath,
        };
      }
      if (rest.length === 3) {
        const post = await this.loadPost(rest[2], subCat.id);
        if (!post || post.categoryId !== subCat.id) return { kind: 'not_found' };
        return {
          kind: 'post',
          city,
          category: subCat as CategoryNode,
          chain: [subtype as CategoryNode, subCat as CategoryNode],
          post,
          canonicalPath: computePostCanonicalPath(post as any),
        };
      }
      return { kind: 'not_found' };
    }

    // Subtypes without SUB: combo, resort, du-thuyen, nha-hang.
    // rest[1] = post slug (no deeper level).
    if (rest.length !== 2) return { kind: 'not_found' };
    const post = await this.loadPost(rest[1], cityCat.id);
    if (!post || post.categoryId !== cityCat.id) return { kind: 'not_found' };
    return {
      kind: 'post',
      city,
      category: cityCat as CategoryNode,
      chain: [subtype as CategoryNode],
      post,
      canonicalPath: computePostCanonicalPath(post as any),
    };
  }

  // -------- Destination tree (no /diem-den/ prefix in URL) --------------
  private async resolveDestination(slugs: string[], canonicalPath: string): Promise<ResolveResult> {
    const citySlug = slugs[0];
    const city = await this.prisma.city.findUnique({
      where: { slug: citySlug },
      select: { id: true, name: true, slug: true },
    });
    if (!city) return { kind: 'not_found' };

    if (slugs.length === 1) return { kind: 'city', city, canonicalPath };

    const destRoot = await this.prisma.category.findFirst({
      where: { slug: 'diem-den', parentId: null, level: 'ROOT' },
      select: CAT_SELECT,
    });
    if (!destRoot) return { kind: 'not_found' };

    // Bridge: destination tree's city-level Category (slug == city.slug, parent = destRoot).
    const cityCat = await this.prisma.category.findFirst({
      where: { slug: citySlug, parentId: destRoot.id, level: 'CITY' },
      select: CAT_SELECT,
    });
    if (!cityCat) return { kind: 'not_found' };

    if (slugs.length === 2) {
      // /{city}/{sub}
      const subCat = await this.prisma.category.findFirst({
        where: { slug: slugs[1], parentId: cityCat.id, level: 'SUB' },
        select: CAT_SELECT,
      });
      if (!subCat) return { kind: 'not_found' };
      // Chain omits cityCat — its slug == city.slug; breadcrumb uses city object.
      return {
        kind: 'category',
        city,
        category: subCat as CategoryNode,
        chain: [subCat as CategoryNode],
        canonicalPath,
      };
    }

    if (slugs.length === 3) {
      // /{city}/{sub}/{post}
      const subCat = await this.prisma.category.findFirst({
        where: { slug: slugs[1], parentId: cityCat.id, level: 'SUB' },
        select: CAT_SELECT,
      });
      if (!subCat) return { kind: 'not_found' };
      const post = await this.loadPost(slugs[2], subCat.id);
      if (!post || post.categoryId !== subCat.id) return { kind: 'not_found' };
      return {
        kind: 'post',
        city,
        category: subCat as CategoryNode,
        chain: [subCat as CategoryNode],
        post,
        canonicalPath: computePostCanonicalPath(post as any),
      };
    }

    return { kind: 'not_found' };
  }

  /**
   * Resolve path AND fetch all supporting data (children + posts) in one call.
   * Eliminates the client-side waterfall: resolve → then fetch children/posts.
   */
  async resolvePage(slugs: string[]) {
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
            where: { published: true, cityId: resolved.city.id, categoryId: { in: destCatIds } },
            take: 12,
            orderBy: { createdAt: 'desc' },
            select: POST_LIST_SELECT,
          })
        : [];
      const posts = rawPosts.map((p) => ({ ...p, canonicalUrl: computePostCanonicalPath(p as any) }));
      return { resolved, children: navCats, cityPills: [], posts };
    }

    // resolved.kind === 'category'
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
      const posts = rawPosts.map((p) => ({ ...p, canonicalUrl: computePostCanonicalPath(p as any) }));
      return { resolved, children: [], cityPills: cities, posts };
    }

    const postsWhere: any = { published: true, categoryId: catId };
    if (cityId) postsWhere.cityId = cityId;
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
    const posts = rawPosts.map((p) => ({ ...p, canonicalUrl: computePostCanonicalPath(p as any) }));
    return { resolved, children: filteredChildren, cityPills: [], posts };
  }

  // -------- Helpers -----------------------------------------------------
  private async loadCity(cityId: string | null): Promise<CityNode | null> {
    if (!cityId) return null;
    const city = await this.prisma.city.findUnique({
      where: { id: cityId },
      select: { id: true, name: true, slug: true },
    });
    return city ?? null;
  }

  private async loadPost(slug: string, categoryId: string) {
    const post = await this.prisma.post.findFirst({
      where: { slug, categoryId },
      include: {
        city: { select: { id: true, name: true, slug: true } },
        category: { select: CATEGORY_WITH_ANCESTORS_SELECT },
      },
    });
    if (!post || !post.published) return null;
    return post;
  }
}
