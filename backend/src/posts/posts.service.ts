import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, SubmitPostDto } from './dto/create-post.dto';
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

  async findAll(query: QueryPostsDto) {
    const {
      cityId,
      categoryId,
      search,
      page = '1',
      limit = '10',
      type,
      sort,
    } = query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const where: Prisma.PostWhereInput = { published: true };

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

  async findOne(slug: string) {
    const post = await this.prisma.post.findFirst({
      where: { slug, published: true },
      include: {
        city: true,
        category: true,
        author: { select: { id: true, name: true, avatar: true } },
      },
    });
    if (!post) throw new NotFoundException('Bài viết không tồn tại');
    return post;
  }

  async findCityFeatured(citySlug: string) {
    const city = await this.prisma.city.findUnique({
      where: { slug: citySlug },
      select: { id: true, name: true, slug: true },
    });
    if (!city) throw new NotFoundException('Tỉnh thành không tồn tại');

    const [destination, itinerary, experience, reviewGroups] =
      await Promise.all([
        this.findTopPostsByCityAndType(
          city.id,
          'destination',
          CITY_SECTION_LIMIT,
        ),
        this.findTopPostsByCityAndType(
          city.id,
          'itinerary',
          CITY_SECTION_LIMIT,
        ),
        this.findTopPostsByCityAndType(
          city.id,
          'experience',
          CITY_SECTION_LIMIT,
        ),
        Promise.all(
          REVIEW_SUBTYPES.map(async (subtype) => ({
            ...subtype,
            posts: await this.findTopReviewPostsBySubtype(
              city.id,
              subtype.slug,
              REVIEW_GROUP_LIMIT,
            ),
          })),
        ),
      ]);

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
    try {
      return await this.prisma.post.create({
        data: {
          ...dto,
          published: dto.published ?? false,
          status: dto.published ? 'approved' : (dto.status ?? 'pending'),
        },
      });
    } catch (e) {
      this.handlePrismaWriteError(e, dto.slug);
      throw e;
    }
  }

  async findAllForAdmin(query: QueryPostsDto) {
    const { cityId, categoryId, search, page = '1', limit = '10' } = query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const where: Prisma.PostWhereInput = {};

    if (cityId) where.cityId = cityId;
    if (categoryId) where.categoryId = categoryId;
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
    try {
      return await this.prisma.post.update({
        where: { id },
        data: {
          ...dto,
          ...(dto.published === true && { status: 'approved' as const }),
          ...(dto.status === 'approved' && { published: true }),
          ...(dto.status === 'rejected' && { published: false }),
        },
      });
    } catch (e) {
      this.handlePrismaWriteError(e, dto.slug);
      throw e;
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
    return this.prisma.post.delete({ where: { id } });
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
      where: { id: { in: rows.map((row) => row.id) } },
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
}
