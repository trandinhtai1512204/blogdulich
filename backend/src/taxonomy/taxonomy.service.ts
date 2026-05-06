import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type ResolveResult =
  | { kind: 'city'; city: { id: string; name: string; slug: string } }
  | { kind: 'category'; city?: { id: string; name: string; slug: string } | null; category: any; chain: any[] }
  | { kind: 'post'; city?: { id: string; name: string; slug: string } | null; category?: any | null; chain: any[]; post: any }
  | { kind: 'not_found' };

@Injectable()
export class TaxonomyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Resolve a URL path to one of: city landing, category landing, post, or not_found.
   *
   * Supported patterns:
   *   /ha-noi                                      → city
   *   /ha-noi/bao-tang                             → city + category
   *   /ha-noi/bao-tang/bai-viet                    → city + category + post
   *   /review-khach-san                            → category (non-root parentId, found via fallback)
   *   /review-khach-san/ha-noi/tieu-muc-1          → category chain 3 levels deep
   *   /lich-trinh-du-lich-ha-noi/3-ngay-2-dem      → category + post
   *
   * Resolution rules:
   * 1. If the first slug matches a City, consume it and resolve the rest as categories/post.
   * 2. For each remaining slug, find a Category with (slug, parentId). parentId starts null.
   * 3. If the first segment fails the strict (slug + parentId) query, fall back to finding any
   *    Category with that slug (ignoring parentId). This allows non-root categories — e.g.
   *    review-khach-san (child of "review") — to serve as URL anchors. Subsequent segments
   *    then resolve normally using that category's id as the new parentId.
   * 4. Any single leftover slug after the category chain is treated as a Post slug.
   */
  async resolve(slugs: string[]): Promise<ResolveResult> {
    if (!slugs.length) return { kind: 'not_found' };

    const first = slugs[0];
    const city = await this.prisma.city.findUnique({
      where: { slug: first },
      select: { id: true, name: true, slug: true },
    });

    const rest = city ? slugs.slice(1) : slugs.slice(0);

    if (city && rest.length === 0) {
      return { kind: 'city', city };
    }

    const chain: any[] = [];
    let parentId: string | null = null;
    let lastCategory: any | null = null;

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

      // First segment only: if strict (slug + parentId=null) fails, try any category with
      // this slug. This lets non-root categories (e.g. review-khach-san, lich-trinh-du-lich-ha-noi)
      // act as URL anchors without requiring parentId=null in the DB.
      if (!cat && i === 0) {
        cat = await this.prisma.category.findFirst({
          where: {
            slug,
            ...(city ? { OR: [{ cityId: null }, { cityId: city.id }] } : {}),
          },
          select: { id: true, name: true, slug: true, type: true, parentId: true, cityId: true },
        });
      }

      if (!cat) break;

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

      if (!post || !post.published) return { kind: 'not_found' };
      if (city && post.cityId && post.cityId !== city.id) return { kind: 'not_found' };
      if (lastCategory && post.categoryId && post.categoryId !== lastCategory.id) return { kind: 'not_found' };

      return { kind: 'post', city: city ?? null, category: lastCategory, chain, post };
    }

    return { kind: 'not_found' };
  }
}

