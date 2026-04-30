import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryPostsDto) {
    const { cityId, categoryId, search, page = '1', limit = '10' } = query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const where: any = { published: true };

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
          createdAt: true,
          city: { select: { id: true, name: true, slug: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data,
      meta: { total, page: pageNumber, limit: limitNumber, totalPages: Math.ceil(total / limitNumber) },
    };
  }

  async findOne(slug: string) {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: {
        city: true,
        category: true,
      },
    });
    if (!post || !post.published) throw new NotFoundException('Bài viết không tồn tại');
    return post;
  }

  create(dto: CreatePostDto) {
    return this.prisma.post.create({ data: dto });
  }

  async update(id: string, dto: Partial<CreatePostDto>) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Bài viết không tồn tại');
    return this.prisma.post.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Bài viết không tồn tại');
    return this.prisma.post.delete({ where: { id } });
  }
}