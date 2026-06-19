import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCityDto } from './dto/create-city.dto';

@Injectable()
export class CitiesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
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
    return this.prisma.city.create({ data: dto });
  }

  async update(id: string, dto: Partial<CreateCityDto>) {
    const city = await this.prisma.city.findUnique({ where: { id } });
    if (!city) throw new NotFoundException('City không tồn tại');
    return this.prisma.city.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const city = await this.prisma.city.findUnique({ where: { id } });
    if (!city) throw new NotFoundException('City không tồn tại');
    return this.prisma.city.delete({ where: { id } });
  }
}
