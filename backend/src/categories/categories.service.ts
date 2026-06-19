import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryCategoriesDto } from './dto/query-categories.dto';

const SYSTEM_ROOTS = [
  { name: 'Điểm đến hấp dẫn', slug: 'diem-den', type: 'destination' },
  { name: 'Lịch trình du lịch', slug: 'lich-trinh-du-lich', type: 'itinerary' },
  { name: 'Review', slug: 'review', type: 'review' },
  { name: 'Kinh nghiệm du lịch', slug: 'kinh-nghiem', type: 'experience' },
] as const;

type CategoryTypeValue = (typeof SYSTEM_ROOTS)[number]['type'];
type CategoryLevel = 'ROOT' | 'SUBTYPE' | 'CITY' | 'SUB';

type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  type: CategoryTypeValue;
  level: CategoryLevel;
  parentId: string | null;
};

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.ensureSystemRoots();
    } catch (e) {
      console.error('[CategoriesService] ensureSystemRoots failed on init:', e);
    }
  }

  private async ensureSystemRoots() {
    // Manual upsert: composite (parentId, slug) unique with parentId=NULL would treat
    // each NULL as distinct, so Prisma `upsert` would always create. Find-then-update.
    await Promise.all(
      SYSTEM_ROOTS.map(async (root) => {
        const existing = await this.prisma.category.findFirst({
          where: { slug: root.slug, parentId: null },
        });
        const data = {
          name: root.name,
          type: root.type,
          level: 'ROOT' as const,
          parentId: null,
          cityId: null,
        };
        if (existing) {
          await this.prisma.category.update({
            where: { id: existing.id },
            data,
          });
        } else {
          await this.prisma.category.create({
            data: { ...data, slug: root.slug },
          });
        }
      }),
    );
  }

  /**
   * Walk parent chain leaf → root. Throws if categoryId not found.
   * Returns at least 1 element (the leaf itself).
   */
  private async walkParentChain(categoryId: string): Promise<CategoryNode[]> {
    const select = {
      id: true,
      name: true,
      slug: true,
      type: true,
      level: true,
      parentId: true,
    } as const;
    const chain: CategoryNode[] = [];
    const first = await this.prisma.category.findUnique({
      where: { id: categoryId },
      select,
    });
    if (!first) throw new NotFoundException('Chuyên mục cha không tồn tại');
    chain.push(first as CategoryNode);
    let parentId: string | null = first.parentId;
    while (parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: parentId },
        select,
      });
      if (!parent) break;
      chain.push(parent as CategoryNode);
      parentId = parent.parentId;
    }
    return chain;
  }

  /**
   * Given the parent (leaf of its own chain), compute the level the new child
   * should have, following sitemap v2 hierarchy rules.
   */
  private computeChildLevel(
    parent: CategoryNode,
    childSlug: string,
  ): CategoryLevel {
    if (parent.level === 'SUB') {
      throw new BadRequestException(
        'Sitemap chỉ cho phép tối đa 4 cấp — không thể tạo cấp con dưới SUB',
      );
    }
    if (parent.level === 'ROOT') {
      if (parent.slug === 'review' && childSlug.startsWith('review-'))
        return 'SUBTYPE';
      return 'CITY';
    }
    if (parent.level === 'SUBTYPE') return 'CITY';
    // parent.level === 'CITY'
    return 'SUB';
  }

  /**
   * Destination keeps a SUB layer for city content. Review must attach posts
   * directly to CITY so public URLs stay at /review/{type}/{city}/{post}.
   */
  private validateChildLevelByModule(
    level: CategoryLevel,
    parentChain: CategoryNode[],
  ) {
    if (level !== 'SUB') return;
    const root = parentChain[parentChain.length - 1];
    if (!root || root.level !== 'ROOT') {
      throw new BadRequestException(
        'Không tìm thấy gốc taxonomy của chuyên mục cha',
      );
    }
    if (root.slug === 'review') {
      throw new BadRequestException(
        'Review không dùng cấp tiểu mục; hãy tạo bài viết trực tiếp dưới tỉnh/thành',
      );
    }
  }

  private isSystemRootSlug(slug: string) {
    return SYSTEM_ROOTS.some((root) => root.slug === slug);
  }

  async findAll(query: QueryCategoriesDto) {
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
        level: true,
        cityId: true,
        parentId: true,
        createdAt: true,
      },
    });
  }

  async findOne(slug: string) {
    // slug is no longer globally unique — use findFirst. Caller can disambiguate
    // by parent if needed via /categories?parentId=...&slug=... (find-many).
    const cat = await this.prisma.category.findFirst({
      where: { slug },
      include: { parent: true, children: true, city: true },
    });
    if (!cat) throw new NotFoundException('Chuyên mục không tồn tại');
    return cat;
  }

  async create(dto: CreateCategoryDto) {
    if (!dto.parentId) {
      throw new BadRequestException(
        'Chỉ cho phép tạo chuyên mục bên dưới danh mục trụ cột',
      );
    }
    if (this.isSystemRootSlug(dto.slug)) {
      throw new BadRequestException(
        'Slug này thuộc danh mục trụ cột hệ thống, vui lòng dùng slug khác',
      );
    }

    const parentChain = await this.walkParentChain(dto.parentId);
    const parent = parentChain[0];
    const root = parentChain[parentChain.length - 1];
    const level = this.computeChildLevel(parent, dto.slug);
    this.validateChildLevelByModule(level, parentChain);

    try {
      return await this.prisma.category.create({
        data: {
          ...dto,
          type: root.type,
          level,
        } as any,
      });
    } catch (e: any) {
      if (e?.code === 'P2002' && e?.meta?.target?.includes('slug')) {
        throw new BadRequestException(
          `Slug "${dto.slug}" đã tồn tại dưới chuyên mục cha này. Hãy đổi slug khác.`,
        );
      }
      throw e;
    }
  }

  async update(id: string, dto: Partial<CreateCategoryDto>) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Chuyên mục không tồn tại');

    const isRoot = !cat.parentId && this.isSystemRootSlug(cat.slug);
    if (isRoot && dto.parentId !== undefined && dto.parentId !== null) {
      throw new BadRequestException(
        'Không thể chuyển danh mục trụ cột thành mục con',
      );
    }
    if (!isRoot && dto.parentId !== undefined && dto.parentId === null) {
      throw new BadRequestException(
        'Không thể chuyển mục con thành danh mục gốc',
      );
    }
    if (!isRoot && dto.slug && this.isSystemRootSlug(dto.slug)) {
      throw new BadRequestException('Slug này thuộc danh mục trụ cột hệ thống');
    }

    const data: any = { ...dto };
    const targetParentId =
      dto.parentId === undefined ? cat.parentId : dto.parentId;
    if (targetParentId) {
      const parentChain = await this.walkParentChain(targetParentId);
      const parent = parentChain[0];
      const root = parentChain[parentChain.length - 1];
      const level = this.computeChildLevel(parent, dto.slug ?? cat.slug);
      this.validateChildLevelByModule(level, parentChain);
      data.type = root.type;
      data.level = level;
    }

    return this.prisma.category.update({ where: { id }, data });
  }

  async remove(id: string) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Chuyên mục không tồn tại');
    if (!cat.parentId && this.isSystemRootSlug(cat.slug)) {
      throw new BadRequestException('Không thể xoá danh mục trụ cột hệ thống');
    }

    const [childrenCount, postsCount] = await Promise.all([
      this.prisma.category.count({ where: { parentId: id } }),
      this.prisma.post.count({ where: { categoryId: id } }),
    ]);
    if (childrenCount > 0) {
      throw new BadRequestException(
        'Không thể xoá: chuyên mục đang có mục con',
      );
    }
    if (postsCount > 0) {
      throw new BadRequestException(
        'Không thể xoá: chuyên mục đang có bài viết',
      );
    }

    return this.prisma.category.delete({ where: { id } });
  }

  async bootstrapRoots() {
    await this.ensureSystemRoots();
    return this.prisma.category.findMany({
      where: { parentId: null, slug: { in: SYSTEM_ROOTS.map((x) => x.slug) } },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        level: true,
        parentId: true,
        cityId: true,
        createdAt: true,
      },
    });
  }
}
