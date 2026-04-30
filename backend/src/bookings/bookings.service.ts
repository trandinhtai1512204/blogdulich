// bookings.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBookingDto) {
    const { hotelId, checkIn, checkOut } = dto;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      throw new BadRequestException('checkOut phải sau checkIn');
    }

    const nights =
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24);

    return this.prisma.$transaction(async (tx) => {
      const hotel = await tx.hotel.findUnique({ where: { id: hotelId } });

      if (!hotel) throw new BadRequestException('Hotel không tồn tại');
      if (hotel.availableRooms <= 0) throw new BadRequestException('Hết phòng');

      // Check overlap với booking đã confirmed
      const overlap = await tx.booking.findFirst({
        where: {
          hotelId,
          status: 'confirmed',
          OR: [{ checkIn: { lt: checkOutDate }, checkOut: { gt: checkInDate } }],
        },
      });

      if (overlap) throw new BadRequestException('Phòng đã được đặt trong khoảng thời gian này');

      const totalPrice = nights * hotel.price;
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // ✅ KHÔNG trừ phòng ở đây — chỉ tạo booking pending
      const booking = await tx.booking.create({
        data: {
          userId,
          hotelId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          totalPrice,
          status: 'pending',
          expiresAt,
        },
      });

      return booking;
    });
  }

  // Xem lịch sử booking của user
  async getMyBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        hotel: {
          select: { id: true, name: true, slug: true, address: true, images: true },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Cancel booking (chỉ cancel được khi đang pending)
  async cancel(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) throw new BadRequestException('Booking không tồn tại');
    if (booking.userId !== userId) throw new BadRequestException('Không phải booking của bạn');
    if (booking.status !== 'pending') throw new BadRequestException('Chỉ có thể hủy booking đang pending');

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' },
    });
  }
}