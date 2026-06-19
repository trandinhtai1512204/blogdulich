// payments.service.ts
import Stripe from 'stripe';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  constructor(private prisma: PrismaService) {}

  async createCheckoutSession(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { hotel: true },
    });

    if (!booking) throw new NotFoundException('Booking không tồn tại');
    if (booking.userId !== userId)
      throw new BadRequestException('Không phải booking của bạn');
    if (booking.status !== 'pending')
      throw new BadRequestException('Booking không hợp lệ');

    // Kiểm tra chưa thanh toán
    const existingPayment = await this.prisma.payment.findUnique({
      where: { bookingId },
    });
    if (existingPayment?.status === 'paid') {
      throw new BadRequestException('Booking này đã được thanh toán');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Đặt phòng: ${booking.hotel.name}`,
              description: `Check-in: ${booking.checkIn.toLocaleDateString('vi-VN')} → Check-out: ${booking.checkOut.toLocaleDateString('vi-VN')}`,
            },
            unit_amount: Math.round(booking.totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { bookingId: booking.id },
      success_url: `${process.env.CLIENT_URL}/booking/success?bookingId=${bookingId}`,
      cancel_url: `${process.env.CLIENT_URL}/booking/cancel?bookingId=${bookingId}`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 phút
    });

    // Lưu payment record
    await this.prisma.payment.upsert({
      where: { bookingId },
      update: { transactionId: session.id, status: 'pending' },
      create: {
        bookingId,
        provider: 'stripe',
        transactionId: session.id,
        amount: booking.totalPrice,
        status: 'pending',
      },
    });

    return { url: session.url, sessionId: session.id };
  }
}
