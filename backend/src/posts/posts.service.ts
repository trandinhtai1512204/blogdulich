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
    const { cityId, categoryId, search, page = '1', limit = '10' } = query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const where: Prisma.PostWhereInput = { published: true };

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
}
