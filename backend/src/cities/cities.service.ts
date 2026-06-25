import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCityDto } from './dto/create-city.dto';

@Injectable()
export class CitiesService {
  private listCache:
    | { expiresAt: number; data: Awaited<ReturnType<CitiesService['buildList']>> }
    | null = null;

  constructor(private prisma: PrismaService) {}

  async findAll() {
    if (this.listCache && this.listCache.expiresAt > Date.now()) {
      return this.listCache.data;
    }
    const data = await this.buildList();
    this.listCache = { data, expiresAt: Date.now() + 10 * 60 * 1000 };
    return data;
  }

  private buildList() {
    return this.prisma.city.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(slug: string) {
    const city = await this.prisma.city.findUnique({
      where: { slug },
      include: {
        hotels: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            price: true,
            images: true,
            availableRooms: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!city) throw new NotFoundException('City không tồn tại');
    return city;
  }

  create(dto: CreateCityDto) {
    this.listCache = null;
    return this.prisma.city.create({ data: dto });
  }

  async update(id: string, dto: Partial<CreateCityDto>) {
    const city = await this.prisma.city.findUnique({ where: { id } });
    if (!city) throw new NotFoundException('City không tồn tại');
    this.listCache = null;
    return this.prisma.city.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const city = await this.prisma.city.findUnique({ where: { id } });
    if (!city) throw new NotFoundException('City không tồn tại');
    this.listCache = null;
    return this.prisma.city.delete({ where: { id } });
  }
}
