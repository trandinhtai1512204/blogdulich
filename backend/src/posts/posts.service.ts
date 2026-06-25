import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, SubmitPostDto, SupportLinkDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import {
  CATEGORY_WITH_ANCESTORS_SELECT,
  computePostCanonicalPath,
} from './post-canonical';

type CitySectionType = 'destination' | 'itinerary' | 'experience';
type RankedPostRow = { id: string; viewCount: number };
type ReviewSubtype = { slug: string; name: string };

const CITY_SECTION_LIMIT = 6;
const REVIEW_GROUP_LIMIT = 3;
const HOME_LIMITS = {
  destination: 48,
  itinerary: 16,
  review: 12,
  experience: 16,
} as const;
const HOME_CACHE_TTL_MS = 10 * 60 * 1000;
const PUBLIC_CACHE_TTL_MS = 10 * 60 * 1000;
const REVIEW_SUBTYPES: ReviewSubtype[] = [
  { slug: 'review-tour', name: 'Review Tour' },
  { slug: 'review-khach-san', name: 'Review Khách Sạn' },
  { slug: 'review-combo', name: 'Review Combo' },
  { slug: 'review-resort', name: 'Review Resort' },
  { slug: 'review-du-thuyen', name: 'Review Du Thuyền' },
  { slug: 'review-nha-hang', name: 'Review Nhà Hàng' },
];

@Injectable()
export class PostsService {
  private homeCache:
    | { expiresAt: number; data: Awaited<ReturnType<PostsService['buildHome']>> }
    | null = null;
  private publicListCache = new Map<
    string,
    { expiresAt: number; data: Awaited<ReturnType<PostsService['buildPostList']>> }
  >();
  private cityFeaturedCache = new Map<
    string,
    {
      expiresAt: number;
      data: Awaited<ReturnType<PostsService['buildCityFeatured']>>;
    }
  >();

  constructor(private prisma: PrismaService) {}

  private slugify(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private cleanSupportingUrlSlug(value?: string | null) {
    if (!value) return undefined;
    const trimmed = value
      .trim()
      .replace(/^https?:\/\/[^/]+/i, '')
      .replace(/^\/+|\/+$/g, '');
    if (!trimmed) return undefined;
    return trimmed.split('/').pop() || trimmed;
  }

  private splitPostPayload(dto: Partial<CreatePostDto>) {
    const { supportLinks: _supportLinks, ...postData } = dto;
    return {
      ...postData,
      supportingUrlSlug: this.cleanSupportingUrlSlug(dto.supportingUrlSlug),
    };
  }

  async findAll(query: QueryPostsDto) {
    const cacheKey = JSON.stringify(query ?? {});
    const cached = this.publicListCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    const data = await this.buildPostList(query);
    this.publicListCache.set(cacheKey, {
      data,
      expiresAt: Date.now() + PUBLIC_CACHE_TTL_MS,
    });
    return data;
  }

  private async buildPostList(query: QueryPostsDto) {
    const {
      cityId,
      categoryId,
      search,
      page = '1',
      limit = '10',
      type,
      kind,
      sort,
    } = query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const where: Prisma.PostWhereInput = { published: true, kind: kind ?? 'standard' };

    if (cityId) where.cityId = cityId;
    if (categoryId) where.categoryId = categoryId;
    if (type) where.category = { type };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    const data = await this.prisma.post.findMany({
      where,
      skip: (pageNumber - 1) * limitNumber,
      take: limitNumber,
      orderBy:
        sort === 'hot'
          ? [{ viewCount: 'desc' }, { createdAt: 'desc' }]
          : { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        thumbnail: true,
        viewCount: true,
        published: true,
        cityId: true,
        categoryId: true,
        createdAt: true,
        city: { select: { id: true, name: true, slug: true } },
        category: { select: CATEGORY_WITH_ANCESTORS_SELECT },
        author: { select: { id: true, name: true, avatar: true } },
      },
    });
    const total = await this.prisma.post.count({ where });

    const enriched = data.map((p) => ({
      ...p,
      canonicalUrl: computePostCanonicalPath(p as any),
    }));

    return {
      data: enriched,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    };
  }

  async findHome() {
    const now = Date.now();
    if (this.homeCache && this.homeCache.expiresAt > now) {
      return this.homeCache.data;
    }

    const data = await this.buildHome();
    this.homeCache = { data, expiresAt: now + HOME_CACHE_TTL_MS };
    return data;
  }

  private async buildHome() {
    const [destination, itinerary, review, experience] = await Promise.all([
      this.findHomePostsByType('destination', HOME_LIMITS.destination),
      this.findHomePostsByType('itinerary', HOME_LIMITS.itinerary),
      this.findHomePostsByType('review', HOME_LIMITS.review),
      this.findHomePostsByType('experience', HOME_LIMITS.experience),
    ]);

    return { destination, itinerary, review, experience };
  }

  async findOne(slug: string) {
    const post = await this.prisma.post.findFirst({
      where: { slug, published: true },
      include: {
        city: true,
        category: true,
        author: { select: { id: true, name: true, avatar: true } },
        supportLinksFrom: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          include: {
            supportPost: {
              select: {
                id: true,
                title: true,
                slug: true,
                supportingUrlSlug: true,
                excerpt: true,
                thumbnail: true,
                published: true,
                kind: true,
              },
            },
          },
        },
      },
    });
    if (!post) throw new NotFoundException('Bài viết không tồn tại');
    return post;
  }

  async findCityFeatured(citySlug: string) {
    const cached = this.cityFeaturedCache.get(citySlug);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    const data = await this.buildCityFeatured(citySlug);
    this.cityFeaturedCache.set(citySlug, {
      data,
      expiresAt: Date.now() + PUBLIC_CACHE_TTL_MS,
    });
    return data;
  }

  private async buildCityFeatured(citySlug: string) {
    const city = await this.prisma.city.findUnique({
      where: { slug: citySlug },
      select: { id: true, name: true, slug: true },
    });
    if (!city) throw new NotFoundException('Tỉnh thành không tồn tại');

    const posts = await this.prisma.post.findMany({
      where: {
        published: true,
        kind: 'standard',
        cityId: city.id,
        category: {
          type: { in: ['destination', 'itinerary', 'experience', 'review'] },
        },
      },
      take: 240,
      orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        thumbnail: true,
        viewCount: true,
        published: true,
        cityId: true,
        categoryId: true,
        createdAt: true,
        city: { select: { id: true, name: true, slug: true } },
        category: { select: CATEGORY_WITH_ANCESTORS_SELECT },
        author: { select: { id: true, name: true, avatar: true } },
      },
    });

    const enriched = posts.map((post) => ({
      ...post,
      canonicalUrl: computePostCanonicalPath(post as any),
    }));

    const byType = (type: CitySectionType, limit: number) =>
      enriched
        .filter((post) => post.category?.type === type)
        .slice(0, limit);

    const destination = byType('destination', CITY_SECTION_LIMIT);
    const itinerary = byType('itinerary', CITY_SECTION_LIMIT);
    const experience = byType('experience', CITY_SECTION_LIMIT);
    const reviewGroups = REVIEW_SUBTYPES.map((subtype) => ({
      ...subtype,
      posts: enriched
        .filter((post) => this.postBelongsToCategorySlug(post, subtype.slug))
        .slice(0, REVIEW_GROUP_LIMIT),
    }));

    return {
      city,
      destination,
      itinerary,
      experience,
      review: {
        groups: reviewGroups,
        posts: reviewGroups.flatMap((group) => group.posts),
      },
    };
  }

  private postBelongsToCategorySlug(
    post: { category?: { slug: string; parent?: any } | null },
    slug: string,
  ) {
    let category = post.category;
    while (category) {
      if (category.slug === slug) return true;
      category = category.parent ?? null;
    }
    return false;
  }

  async incrementViewCount(id: string) {
    const rows = await this.prisma.$queryRaw<
      { id: string; viewCount: number }[]
    >`
      UPDATE "posts"
      SET "viewCount" = "viewCount" + 1
      WHERE "id" = ${id}
      RETURNING "id", "viewCount"
    `;
    const updated = rows[0];
    if (!updated) throw new NotFoundException('Bài viết không tồn tại');
    return updated;
  }

  async create(dto: CreatePostDto) {
    const postData = this.splitPostPayload(dto);
    try {
      const post = await this.prisma.post.create({
        data: {
          ...postData,
          kind: postData.kind ?? 'standard',
          published: dto.published ?? false,
          status: dto.published ? 'approved' : (dto.status ?? 'pending'),
        } as Prisma.PostUncheckedCreateInput,
      });
      if (dto.supportLinks) {
        await this.replaceSupportLinks(post.id, post.kind, dto.supportLinks);
      }
      this.clearPublicCaches();
      return post;
    } catch (e) {
      this.handlePrismaWriteError(e, dto.slug);
      throw e;
    }
  }

  async findAllForAdmin(query: QueryPostsDto) {
    const {
      cityId,
      categoryId,
      search,
      page = '1',
      limit = '10',
      type,
      kind,
    } = query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const where: Prisma.PostWhereInput = {};

    if (cityId) where.cityId = cityId;
    if (categoryId) where.categoryId = categoryId;
    if (kind) where.kind = kind;
    if (type) where.category = { type };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
        orderBy: { createdAt: 'desc' },
        include: {
          city: { select: { id: true, name: true, slug: true } },
          category: { select: CATEGORY_WITH_ANCESTORS_SELECT },
          author: {
            select: { id: true, name: true, avatar: true, email: true },
          },
          supportLinksFrom: {
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
            include: {
              supportPost: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  supportingUrlSlug: true,
                  excerpt: true,
                  published: true,
                  kind: true,
                },
              },
            },
          },
          supportLinksTo: {
            orderBy: [
              { isPrimary: 'desc' },
              { sortOrder: 'asc' },
              { createdAt: 'asc' },
            ],
            include: {
              mainPost: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  excerpt: true,
                  published: true,
                  kind: true,
                  category: { select: CATEGORY_WITH_ANCESTORS_SELECT },
                },
              },
            },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    const enriched = data.map((p) => ({
      ...p,
      canonicalUrl: computePostCanonicalPath(p as any),
    }));

    return {
      data: enriched,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    };
  }

  async submitCommunityPost(dto: SubmitPostDto, authorId: string) {
    const baseSlug = this.slugify(dto.slug || dto.title);
    const slug = `${baseSlug || 'bai-viet'}-${Date.now().toString(36)}`;

    try {
      return await this.prisma.post.create({
        data: {
          title: dto.title,
          slug,
          content: dto.content,
          excerpt: dto.excerpt,
          thumbnail: dto.thumbnail,
          location: dto.location,
          latitude: dto.latitude,
          longitude: dto.longitude,
          cityId: dto.cityId,
          categoryId: dto.categoryId,
          authorId,
          published: false,
          status: 'pending',
        },
        include: {
          city: true,
          category: true,
          author: { select: { id: true, name: true, avatar: true } },
        },
      });
    } catch (e) {
      this.handlePrismaWriteError(e, slug);
      throw e;
    }
  }

  findByAuthor(authorId: string) {
    return this.prisma.post.findMany({
      where: { authorId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        thumbnail: true,
        published: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        city: { select: { id: true, name: true, slug: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async update(id: string, dto: Partial<CreatePostDto>) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Bài viết không tồn tại');
    const postData = this.splitPostPayload(dto);
    try {
      const updated = await this.prisma.post.update({
        where: { id },
        data: {
          ...postData,
          ...(dto.published === true && { status: 'approved' as const }),
          ...(dto.status === 'approved' && { published: true }),
          ...(dto.status === 'rejected' && { published: false }),
        } as Prisma.PostUncheckedUpdateInput,
      });
      if (dto.supportLinks) {
        await this.replaceSupportLinks(id, updated.kind, dto.supportLinks);
      }
      this.clearPublicCaches();
      return updated;
    } catch (e) {
      this.handlePrismaWriteError(e, dto.slug);
      throw e;
    }
  }

  private async replaceSupportLinks(
    postId: string,
    kind: 'standard' | 'supporting',
    links: SupportLinkDto[],
  ) {
    if (kind === 'supporting') {
      await this.prisma.supportingArticleLink.deleteMany({
        where: { supportPostId: postId },
      });
      const rows = links
        .filter((link) => link.mainPostId && link.mainPostId !== postId)
        .map((link, index) => ({
          mainPostId: link.mainPostId as string,
          supportPostId: postId,
          anchorText: link.anchorText?.trim() || null,
          secondaryKeywords: link.secondaryKeywords?.trim() || null,
          sortOrder: link.sortOrder ?? index,
          isPrimary: Boolean(link.isPrimary),
        }));
      if (rows.length > 0 && !rows.some((row) => row.isPrimary)) {
        rows[0].isPrimary = true;
      }
      if (rows.length > 0) {
        await this.prisma.supportingArticleLink.createMany({
          data: rows,
          skipDuplicates: true,
        });
      }
      return;
    }

    await this.prisma.supportingArticleLink.deleteMany({
      where: { mainPostId: postId },
    });
    const rows = links
      .filter((link) => link.supportPostId && link.supportPostId !== postId)
      .map((link, index) => ({
        mainPostId: postId,
        supportPostId: link.supportPostId as string,
        anchorText: link.anchorText?.trim() || null,
        secondaryKeywords: link.secondaryKeywords?.trim() || null,
        sortOrder: link.sortOrder ?? index,
        isPrimary: Boolean(link.isPrimary),
      }));
    if (rows.length > 0) {
      await this.prisma.supportingArticleLink.createMany({
        data: rows,
        skipDuplicates: true,
      });
    }
  }

  private handlePrismaWriteError(e: unknown, slug?: string): void {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        const target = (e.meta?.target as string[] | string | undefined) ?? '';
        const targetStr = Array.isArray(target)
          ? target.join(',')
          : String(target);
        if (targetStr.includes('slug')) {
          throw new ConflictException(
            slug
              ? `Slug "${slug}" đã tồn tại. Vui lòng chọn slug khác (ví dụ thêm tên tỉnh).`
              : 'Slug đã tồn tại. Vui lòng chọn slug khác.',
          );
        }
        throw new ConflictException(
          'Bản ghi đã tồn tại (vi phạm ràng buộc duy nhất).',
        );
      }
      if (e.code === 'P2003') {
        throw new ConflictException(
          'Tham chiếu không hợp lệ (categoryId hoặc cityId không tồn tại).',
        );
      }
    }
  }

  async remove(id: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Bài viết không tồn tại');
    const deleted = await this.prisma.post.delete({ where: { id } });
    this.clearPublicCaches();
    return deleted;
  }

  private clearPublicCaches() {
    this.homeCache = null;
    this.publicListCache.clear();
    this.cityFeaturedCache.clear();
  }

  private async findTopPostsByCityAndType(
    cityId: string,
    type: CitySectionType,
    limit: number,
  ) {
    const rows = await this.prisma.$queryRaw<RankedPostRow[]>`
      SELECT p."id", p."viewCount"
      FROM "posts" p
      INNER JOIN "categories" c ON c."id" = p."categoryId"
      WHERE p."published" = true
        AND p."kind"::text = 'standard'
        AND p."cityId" = ${cityId}
        AND c."type"::text = ${type}
      ORDER BY p."viewCount" DESC, p."createdAt" DESC
      LIMIT ${limit}
    `;

    return this.hydrateRankedPosts(rows);
  }

  private async findTopReviewPostsBySubtype(
    cityId: string,
    subtypeSlug: string,
    limit: number,
  ) {
    const rows = await this.prisma.$queryRaw<RankedPostRow[]>`
      SELECT p."id", p."viewCount"
      FROM "posts" p
      INNER JOIN "categories" c ON c."id" = p."categoryId"
      LEFT JOIN "categories" parent ON parent."id" = c."parentId"
      LEFT JOIN "categories" grandparent ON grandparent."id" = parent."parentId"
      WHERE p."published" = true
        AND p."kind"::text = 'standard'
        AND p."cityId" = ${cityId}
        AND c."type"::text = 'review'
        AND (
          c."slug" = ${subtypeSlug}
          OR parent."slug" = ${subtypeSlug}
          OR grandparent."slug" = ${subtypeSlug}
        )
      ORDER BY p."viewCount" DESC, p."createdAt" DESC
      LIMIT ${limit}
    `;

    return this.hydrateRankedPosts(rows);
  }

  private async hydrateRankedPosts(rows: RankedPostRow[]) {
    if (rows.length === 0) return [];

    const viewCountById = new Map(rows.map((row) => [row.id, row.viewCount]));
    const orderById = new Map(rows.map((row, index) => [row.id, index]));
    const posts = await this.prisma.post.findMany({
      where: { id: { in: rows.map((row) => row.id) }, kind: 'standard' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        thumbnail: true,
        published: true,
        cityId: true,
        categoryId: true,
        createdAt: true,
        city: { select: { id: true, name: true, slug: true } },
        category: { select: CATEGORY_WITH_ANCESTORS_SELECT },
        author: { select: { id: true, name: true, avatar: true } },
      },
    });

    return posts
      .map((post) => ({
        ...post,
        viewCount: viewCountById.get(post.id) ?? 0,
        canonicalUrl: computePostCanonicalPath(post as any),
      }))
      .sort((a, b) => (orderById.get(a.id) ?? 0) - (orderById.get(b.id) ?? 0));
  }

  private async findHomePostsByType(type: Prisma.EnumCategoryTypeFilter['equals'], limit: number) {
    const posts = await this.prisma.post.findMany({
      where: { published: true, kind: 'standard', category: { type } },
      take: limit,
      orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        thumbnail: true,
        viewCount: true,
        cityId: true,
        categoryId: true,
        createdAt: true,
        city: { select: { id: true, name: true, slug: true } },
        category: { select: CATEGORY_WITH_ANCESTORS_SELECT },
      },
    });

    return posts.map((post) => ({
      ...post,
      canonicalUrl: computePostCanonicalPath(post as any),
    }));
  }
}
