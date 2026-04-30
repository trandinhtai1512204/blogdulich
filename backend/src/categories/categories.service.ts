import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryCategoriesDto } from './dto/query-categories.dto';

const SYSTEM_ROOTS = [
  { name: 'Giới thiệu', slug: 'about', type: 'about' },
  { name: 'Điểm đến hấp dẫn', slug: 'diem-den', type: 'destination' },
  { name: 'Lịch trình du lịch', slug: 'lich-trinh-du-lich', type: 'itinerary' },
  { name: 'Chi phí du lịch', slug: 'chi-phi-du-lich', type: 'cost' },
  { name: 'Review', slug: 'review', type: 'review' },
  { name: 'Kinh nghiệm du lịch', slug: 'kinh-nghiem', type: 'experience' },
] as const;

type CategoryTypeValue = (typeof SYSTEM_ROOTS)[number]['type'];

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  private async ensureSystemRoots() {
    await Promise.all(
      SYSTEM_ROOTS.map((root) =>
        this.prisma.category.upsert({
          where: { slug: root.slug },
          create: {
            name: root.name,
            slug: root.slug,
            type: root.type,
            parentId: null,
            cityId: null,
          },
          update: {
            name: root.name,
            type: root.type,
            parentId: null,
            cityId: null,
          },
        }),
      ),
    );
  }

  private async resolveRootType(categoryId: string): Promise<CategoryTypeValue> {
    const current = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, type: true, parentId: true },
    });
    if (!current) throw new NotFoundException('Chuyên mục cha không tồn tại');
    let node = current;

    while (node.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: node.parentId },
        select: { id: true, type: true, parentId: true },
      });
      if (!parent) break;
      node = parent;
    }

    return node.type as CategoryTypeValue;
  }

  private isSystemRootSlug(slug: string) {
    return SYSTEM_ROOTS.some((root) => root.slug === slug);
  }

  async findAll(query: QueryCategoriesDto) {
    await this.ensureSystemRoots();
    const { type, cityId, parentId } = query;
    const where: any = {};
    if (type) where.type = type;
    if (cityId) where.cityId = cityId;
    if (parentId) where.parentId = parentId;

    return this.prisma.category.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        cityId: true,
        parentId: true,
        createdAt: true,
      },
    });
  }

  async findOne(slug: string) {
    await this.ensureSystemRoots();
    const cat = await this.prisma.category.findUnique({
      where: { slug },
      include: { parent: true, children: true, city: true },
    });
    if (!cat) throw new NotFoundException('Chuyên mục không tồn tại');
    return cat;
  }

  async create(dto: CreateCategoryDto) {
    await this.ensureSystemRoots();
    if (!dto.parentId) {
      throw new BadRequestException('Chỉ cho phép tạo chuyên mục bên dưới danh mục trụ cột');
    }

    const type = await this.resolveRootType(dto.parentId);
    if (this.isSystemRootSlug(dto.slug)) {
      throw new BadRequestException('Slug này thuộc danh mục trụ cột hệ thống, vui lòng dùng slug khác');
    }

    return this.prisma.category.create({
      data: {
        ...dto,
        type,
      } as any,
    });
  }

  async update(id: string, dto: Partial<CreateCategoryDto>) {
    await this.ensureSystemRoots();
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Chuyên mục không tồn tại');

    const isRoot = !cat.parentId && this.isSystemRootSlug(cat.slug);
    if (isRoot && dto.parentId !== undefined && dto.parentId !== null) {
      throw new BadRequestException('Không thể chuyển danh mục trụ cột thành mục con');
    }
    if (!isRoot && dto.parentId !== undefined && dto.parentId === null) {
      throw new BadRequestException('Không thể chuyển mục con thành danh mục gốc');
    }
    if (!isRoot && dto.slug && this.isSystemRootSlug(dto.slug)) {
      throw new BadRequestException('Slug này thuộc danh mục trụ cột hệ thống');
    }

    let type: any = dto.type;
    const targetParentId = dto.parentId === undefined ? cat.parentId : dto.parentId;
    if (targetParentId) {
      type = await this.resolveRootType(targetParentId);
    }

    return this.prisma.category.update({
      where: { id },
      data: { ...dto, type } as any,
    });
  }

  async remove(id: string) {
    await this.ensureSystemRoots();
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Chuyên mục không tồn tại');
    if (!cat.parentId && this.isSystemRootSlug(cat.slug)) {
      throw new BadRequestException('Không thể xoá danh mục trụ cột hệ thống');
    }

    // Prevent deleting category that still has children or posts
    const [childrenCount, postsCount] = await Promise.all([
      this.prisma.category.count({ where: { parentId: id } }),
      this.prisma.post.count({ where: { categoryId: id } }),
    ]);
    if (childrenCount > 0) {
      throw new NotFoundException('Không thể xoá: chuyên mục đang có mục con');
    }
    if (postsCount > 0) {
      throw new NotFoundException('Không thể xoá: chuyên mục đang có bài viết');
    }

    return this.prisma.category.delete({ where: { id } });
  }

  async bootstrapRoots() {
    await this.ensureSystemRoots();
    return this.prisma.category.findMany({
      where: { parentId: null, slug: { in: SYSTEM_ROOTS.map((x) => x.slug) } },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, slug: true, type: true, parentId: true, cityId: true, createdAt: true },
    });
  }
}

