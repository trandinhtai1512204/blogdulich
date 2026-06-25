import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryHotelsDto } from './dto/query-hotels.dto';
import { CreateHotelDto } from './dto/create-hotel.dto';

@Injectable()
export class HotelsService {
  private listCache = new Map<
    string,
    { expiresAt: number; data: Awaited<ReturnType<HotelsService['buildList']>> }
  >();

  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryHotelsDto) {
    const cacheKey = JSON.stringify(query ?? {});
    const cached = this.listCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    const data = await this.buildList(query);
    this.listCache.set(cacheKey, { data, expiresAt: Date.now() + 10 * 60 * 1000 });
    return data;
  }

  private async buildList(query: QueryHotelsDto) {
    const {
      cityId,
      search,
      minPrice,
      maxPrice,
      page = '1',
      limit = '10',
    } = query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const where: any = {};

    if (cityId) where.cityId = cityId;
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const [data, total] = await Promise.all([
      this.prisma.hotel.findMany({
        where,
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
        orderBy: { createdAt: 'desc' },
        include: { city: true },
      }),
      this.prisma.hotel.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    };
  }

  async findOne(slug: string) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { slug },
      include: { city: true },
    });
    if (!hotel) throw new NotFoundException('Hotel không tồn tại');
    return hotel;
  }

  create(dto: CreateHotelDto) {
    this.listCache.clear();
    return this.prisma.hotel.create({ data: dto });
  }

  async update(id: string, dto: Partial<CreateHotelDto>) {
    const hotel = await this.prisma.hotel.findUnique({ where: { id } });
    if (!hotel) throw new NotFoundException('Hotel không tồn tại');
    this.listCache.clear();
    return this.prisma.hotel.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const hotel = await this.prisma.hotel.findUnique({ where: { id } });
    if (!hotel) throw new NotFoundException('Hotel không tồn tại');
    this.listCache.clear();
    return this.prisma.hotel.delete({ where: { id } });
  }
}
