import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryType, Faq, FaqTargetType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFaqDto, QueryFaqDto, ResolveFaqDto, UpdateFaqDto } from './dto/faq.dto';

type CategoryNode = {
  id: string;
  name: string;
  type: CategoryType;
  parentId: string | null;
  cityId: string | null;
};

const FAQ_SELECT = {
  id: true,
  targetType: true,
  targetId: true,
  module: true,
  question: true,
  answer: true,
  sortOrder: true,
  published: true,
  createdAt: true,
  updatedAt: true,
} as const;

const DEFAULT_FAQS: Record<CategoryType, Array<{ question: string; answer: string }>> = {
  destination: [
    {
      question: 'Du lịch Việt Nam nên đi đâu đẹp nhất?',
      answer:
        'Việt Nam có nhiều điểm đến nổi bật như Hà Nội, Hội An, Đà Nẵng, Sa Pa, Hạ Long và Phú Quốc. Nếu thích văn hóa, hãy ưu tiên Hà Nội hoặc Hội An; nếu thích biển, Đà Nẵng và Phú Quốc là lựa chọn dễ đi.',
    },
    {
      question: 'Mùa nào thích hợp để đi du lịch miền Bắc?',
      answer:
        'Khoảng tháng 9 đến tháng 11 thường là thời điểm dễ chịu nhất ở miền Bắc vì trời mát, ít mưa và cảnh quan đẹp. Mùa xuân cũng phù hợp nếu bạn muốn kết hợp lễ hội và khám phá văn hóa địa phương.',
    },
    {
      question: 'Điểm đến nào phù hợp cho du lịch gia đình?',
      answer:
        'Đà Nẵng, Phú Quốc, Hà Nội và Đà Lạt thường phù hợp cho gia đình vì có nhiều lựa chọn lưu trú, ăn uống, vui chơi và di chuyển tương đối thuận tiện.',
    },
    {
      question: 'Du lịch tự túc nên chọn điểm đến nào?',
      answer:
        'Hà Nội, Đà Nẵng, Hội An và Phú Quốc là những điểm đến thân thiện với khách tự túc. Các nơi này có nhiều thông tin tham khảo, dịch vụ du lịch phổ biến và phương tiện di chuyển dễ sắp xếp.',
    },
  ],
  itinerary: [
    {
      question: 'Nên lên lịch trình du lịch trước bao lâu?',
      answer:
        'Với chuyến đi ngắn ngày, bạn nên lên lịch trình trước 1 đến 2 tuần. Với mùa cao điểm hoặc chuyến đi gia đình, nên chuẩn bị trước 3 đến 4 tuần để dễ đặt vé, khách sạn và tối ưu chi phí.',
    },
    {
      question: 'Một lịch trình du lịch nên có những phần nào?',
      answer:
        'Một lịch trình tốt nên có điểm đến chính, thời gian di chuyển, nơi ăn ở, hoạt động từng ngày, phương án dự phòng khi mưa hoặc quá tải và ngân sách ước tính.',
    },
    {
      question: 'Có nên đi quá nhiều điểm trong một ngày không?',
      answer:
        'Không nên xếp quá dày vì dễ mệt và mất thời gian di chuyển. Mỗi ngày nên chọn 2 đến 4 điểm chính, ưu tiên các điểm gần nhau để chuyến đi thoải mái hơn.',
    },
  ],
  review: [
    {
      question: 'Review trên BlogDuLich.vn có dùng để đặt dịch vụ trực tiếp không?',
      answer:
        'Các bài review giúp bạn tham khảo trải nghiệm, ưu nhược điểm và bối cảnh sử dụng dịch vụ. Trước khi đặt, bạn vẫn nên kiểm tra lại giá, điều kiện hủy và thông tin mới nhất từ nhà cung cấp.',
    },
    {
      question: 'Nên đọc review du lịch như thế nào cho đúng?',
      answer:
        'Hãy chú ý thời điểm trải nghiệm, ngân sách, phong cách đi và nhu cầu của người viết. Một review phù hợp nhất là review có hoàn cảnh gần với chuyến đi bạn đang lên kế hoạch.',
    },
    {
      question: 'Review khách sạn, tour và combo khác nhau ở đâu?',
      answer:
        'Review khách sạn tập trung vào lưu trú, vị trí và tiện nghi; review tour nói về lịch trình và hướng dẫn; review combo thường đánh giá tổng thể vé, phòng, dịch vụ đi kèm và mức độ tiện lợi.',
    },
  ],
  experience: [
    {
      question: 'Kinh nghiệm du lịch nên đọc trước chuyến đi bao lâu?',
      answer:
        'Bạn nên đọc kinh nghiệm tổng quan trước khi đặt vé và đọc lại các mẹo chi tiết trước ngày đi vài hôm để chuẩn bị hành lý, lịch trình và các lưu ý tại điểm đến.',
    },
    {
      question: 'Đi du lịch tự túc cần chuẩn bị gì?',
      answer:
        'Các phần quan trọng gồm giấy tờ cá nhân, đặt phòng, phương tiện di chuyển, danh sách điểm ăn chơi, ngân sách dự phòng, thuốc cơ bản và phương án liên hệ khi cần hỗ trợ.',
    },
    {
      question: 'Làm sao để tiết kiệm chi phí du lịch?',
      answer:
        'Bạn có thể đi vào ngày thường, đặt sớm, chọn khu lưu trú hợp lý, dùng phương tiện công cộng khi thuận tiện và ưu tiên trải nghiệm phù hợp thay vì xếp quá nhiều dịch vụ đắt tiền.',
    },
  ],
};

@Injectable()
export class FaqsService {
  constructor(private prisma: PrismaService) {}

  findAll(query: QueryFaqDto) {
    const where: Prisma.FaqWhereInput = {};
    if (query.targetType) where.targetType = query.targetType;
    if (query.targetId) where.targetId = query.targetId;
    if (query.module) where.module = query.module;
    if (query.includeUnpublished !== 'true') where.published = true;

    return this.prisma.faq.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: FAQ_SELECT,
    });
  }

  async resolve(query: ResolveFaqDto) {
    const buckets = await this.resolveBuckets(query);
    const resolved = this.mergeFaqs(buckets);
    if (resolved.length > 0) return resolved;

    const module = await this.resolveModule(query);
    return this.defaultFaqs(module);
  }

  create(dto: CreateFaqDto) {
    return this.prisma.faq.create({
      data: this.normalizeCreateDto(dto),
      select: FAQ_SELECT,
    });
  }

  async update(id: string, dto: UpdateFaqDto) {
    await this.ensureExists(id);
    return this.prisma.faq.update({
      where: { id },
      data: this.normalizeUpdateDto(dto),
      select: FAQ_SELECT,
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.faq.delete({
      where: { id },
      select: { id: true },
    });
  }

  private normalizeCreateDto(dto: CreateFaqDto): Prisma.FaqCreateInput {
    return {
      targetType: dto.targetType,
      targetId: dto.targetType === 'global' ? null : dto.targetId,
      module: dto.module,
      question: dto.question.trim(),
      answer: dto.answer.trim(),
      sortOrder: dto.sortOrder ?? 0,
      published: dto.published ?? true,
    };
  }

  private normalizeUpdateDto(dto: UpdateFaqDto): Prisma.FaqUpdateInput {
    const data: Prisma.FaqUpdateInput = {
      ...dto,
      question: dto.question?.trim(),
      answer: dto.answer?.trim(),
    };
    if (dto.targetType === 'global') data.targetId = null;
    return data;
  }

  private async ensureExists(id: string) {
    const faq = await this.prisma.faq.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!faq) throw new NotFoundException('FAQ không tồn tại');
  }

  private async resolveBuckets(query: ResolveFaqDto): Promise<Faq[][]> {
    if (query.targetType === 'global') {
      return [await this.findPublished('global', null, query.module)];
    }

    if (!query.targetId) return [];

    if (query.targetType === 'post') {
      const post = await this.prisma.post.findUnique({
        where: { id: query.targetId },
        select: {
          id: true,
          cityId: true,
          categoryId: true,
          category: { select: { id: true, name: true, type: true, parentId: true, cityId: true } },
        },
      });
      if (!post) return [];
      const module = query.module ?? post.category?.type ?? 'destination';
      const chain = post.categoryId ? await this.categoryChain(post.categoryId) : [];
      return [
        await this.findPublished('post', post.id),
        ...await this.categoryBuckets(chain),
        ...(post.cityId ? [await this.findPublished('city', post.cityId)] : []),
        await this.findPublished('global', null, module),
      ];
    }

    if (query.targetType === 'category') {
      const chain = await this.categoryChain(query.targetId);
      const leaf = chain[0];
      if (!leaf) return [];
      return [
        ...await this.categoryBuckets(chain),
        ...(leaf.cityId ? [await this.findPublished('city', leaf.cityId)] : []),
        await this.findPublished('global', null, query.module ?? leaf.type),
      ];
    }

    if (query.targetType === 'city') {
      return [
        await this.findPublished('city', query.targetId),
        await this.findPublished('global', null, query.module ?? 'destination'),
      ];
    }

    return [];
  }

  private async resolveModule(query: ResolveFaqDto): Promise<CategoryType> {
    if (query.module) return query.module;
    if (query.targetType === 'post' && query.targetId) {
      const post = await this.prisma.post.findUnique({
        where: { id: query.targetId },
        select: { category: { select: { type: true } } },
      });
      return post?.category?.type ?? 'destination';
    }
    if (query.targetType === 'category' && query.targetId) {
      const category = await this.prisma.category.findUnique({
        where: { id: query.targetId },
        select: { type: true },
      });
      return category?.type ?? 'destination';
    }
    if (query.targetType === 'city') return 'destination';
    return 'destination';
  }

  private async categoryBuckets(chain: CategoryNode[]) {
    const buckets: Faq[][] = [];
    for (const category of chain) {
      buckets.push(await this.findPublished('category', category.id));
    }
    return buckets;
  }

  private async findPublished(targetType: FaqTargetType, targetId?: string | null, module?: CategoryType) {
    return this.prisma.faq.findMany({
      where: {
        targetType,
        targetId: targetId ?? null,
        ...(module ? { module } : {}),
        published: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: FAQ_SELECT,
    });
  }

  private async categoryChain(categoryId: string): Promise<CategoryNode[]> {
    const chain: CategoryNode[] = [];
    let cursor: string | null = categoryId;
    while (cursor) {
      const category = await this.prisma.category.findUnique({
        where: { id: cursor },
        select: { id: true, name: true, type: true, parentId: true, cityId: true },
      });
      if (!category) break;
      chain.push(category);
      cursor = category.parentId;
    }
    return chain;
  }

  private mergeFaqs(buckets: Faq[]) : Faq[];
  private mergeFaqs(buckets: Faq[][]) : Faq[];
  private mergeFaqs(buckets: Faq[] | Faq[][]) {
    const flat = Array.isArray(buckets[0])
      ? (buckets as Faq[][]).flat()
      : (buckets as Faq[]);
    const seen = new Set<string>();
    const result: Faq[] = [];
    for (const faq of flat) {
      const key = faq.question.trim().toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(faq);
      if (result.length >= 8) break;
    }
    return result;
  }

  private defaultFaqs(module: CategoryType) {
    return DEFAULT_FAQS[module].map((item, index) => ({
      id: `default-${module}-${index}`,
      targetType: 'global' as const,
      targetId: null,
      module,
      question: item.question,
      answer: item.answer,
      sortOrder: index,
      published: true,
      createdAt: null,
      updatedAt: null,
    }));
  }
}
