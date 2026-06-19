import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, hotelId: string, dto: CreateReviewDto) {
    const hotel = await this.prisma.hotel.findUnique({
      where: { id: hotelId },
    });
    if (!hotel) throw new NotFoundException('Hotel không tồn tại');

    // Chỉ được review nếu đã có booking confirmed
    const booking = await this.prisma.booking.findFirst({
      where: { userId, hotelId, status: 'confirmed' },
    });
    if (!booking)
      throw new BadRequestException(
        'Bạn cần đặt phòng thành công mới được đánh giá',
      );

    return this.prisma.review.upsert({
      where: { userId_hotelId: { userId, hotelId } },
      create: { userId, hotelId, ...dto },
      update: { rating: dto.rating, comment: dto.comment },
    });
  }

  async findByHotel(hotelId: string) {
    const [reviews, aggregate, ratingGroups] = await Promise.all([
      this.prisma.review.findMany({
        where: { hotelId },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.aggregate({
        where: { hotelId },
        _count: { _all: true },
        _avg: { rating: true },
      }),
      this.prisma.review.groupBy({
        by: ['rating'],
        where: { hotelId },
        _count: { _all: true },
      }),
    ]);

    const total = aggregate._count._all;
    const avg = aggregate._avg.rating ?? 0;
    const countByRating = new Map(
      ratingGroups.map((g) => [g.rating, g._count._all]),
    );
    const distribution = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: countByRating.get(star) ?? 0,
    }));

    return { reviews, total, avg: Math.round(avg * 10) / 10, distribution };
  }

  async delete(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException('Review không tồn tại');
    if (review.userId !== userId)
      throw new BadRequestException('Không phải review của bạn');
    return this.prisma.review.delete({ where: { id: reviewId } });
  }
}
