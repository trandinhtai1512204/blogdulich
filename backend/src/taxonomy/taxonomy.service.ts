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
   * Resolve a path like:
   * - /ha-noi
   * - /ha-noi/bao-tang
   * - /ha-noi/bao-tang/van-mieu
   * - /review-tour/tieu-muc-1/tieu-muc-con-1
   *
   * Rules:
   * - First slug may be a City slug. If it is, categories can optionally be scoped to that city.
   * - Remaining slugs (except maybe last) are treated as a Category chain (parent -> child).
   * - If an extra last slug remains after resolving categories, treat it as a Post.slug and validate it belongs to the last category/city (when set).
   */
  async resolve(slugs: string[]): Promise<ResolveResult> {
    if (!slugs.length) return { kind: 'not_found' };

    const first = slugs[0];
    const city = await this.prisma.city.findUnique({
      where: { slug: first },
      select: { id: true, name: true, slug: true },
    });

    const rest = city ? slugs.slice(1) : slugs.slice(0);

    // City-only landing
    if (city && rest.length === 0) {
      return { kind: 'city', city };
    }

    // Resolve category chain from rest
    const chain: any[] = [];
    let parentId: string | null = null;
    let lastCategory: any | null = null;

    // Try to resolve as many segments as categories (greedy), leave last as potential post slug.
    for (let i = 0; i < rest.length; i++) {
      const slug = rest[i];

      const cat = await this.prisma.category.findFirst({
        where: {
          slug,
          parentId,
          ...(city ? { OR: [{ cityId: null }, { cityId: city.id }] } : {}),
        },
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          parentId: true,
          cityId: true,
        },
      });

      if (!cat) {
        // If we haven't resolved any category yet, maybe first slug itself is a category
        // (this only happens when city is null; handled by starting rest=slugs above).
        break;
      }

      chain.push(cat);
      lastCategory = cat;
      parentId = cat.id;
    }

    const consumedCategories = chain.length;
    const remainingAfterCategories = rest.slice(consumedCategories);

    // If no categories resolved and city is null, attempt: single category slug (index)
    if (!city && chain.length === 0) {
      const cat = await this.prisma.category.findUnique({
        where: { slug: first },
        select: { id: true, name: true, slug: true, type: true, parentId: true, cityId: true },
      });
      if (cat) {
        return { kind: 'category', city: null, category: cat, chain: [cat] };
      }
    }

    // Category landing (no post)
    if (remainingAfterCategories.length === 0 && lastCategory) {
      return { kind: 'category', city: city ?? null, category: lastCategory, chain };
    }

    // If exactly one slug remains, treat as post slug
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

      // Validate city match if path is city-scoped
      if (city && post.cityId && post.cityId !== city.id) return { kind: 'not_found' };

      // Validate category match if path provides categories
      if (lastCategory && post.categoryId && post.categoryId !== lastCategory.id) return { kind: 'not_found' };

      return {
        kind: 'post',
        city: city ?? null,
        category: lastCategory,
        chain,
        post,
      };
    }

    return { kind: 'not_found' };
  }
}

