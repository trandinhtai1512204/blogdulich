import { Controller, Post, Param, Req, Headers, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';
import { MailService } from '../mail/mail.service';

@Controller('payments')
export class PaymentsController {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

  constructor(
    private prisma: PrismaService,
    private paymentsService: PaymentsService,
    private mailService: MailService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('checkout/:bookingId')
  createCheckout(@Param('bookingId') bookingId: string, @Req() req: any) {
    return this.paymentsService.createCheckoutSession(bookingId, req.user.sub);
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') sig: string,
  ) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
    let event: any;

    try {
      event = this.stripe.webhooks.constructEvent(
        (req as any).rawBody ?? req.body,
        sig,
        endpointSecret,
      );
    } catch (err) {
      console.log('❌ Webhook verify failed:', err.message);
      throw err;
    }

    console.log('✅ Webhook received:', event.type);

    // ── Thanh toán thành công ──────────────────────────────
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;

      if (!bookingId) return { received: true };

      // Lấy booking TRƯỚC transaction
      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: { hotel: true, user: true },
      });

      if (!booking || booking.status !== 'pending') return { received: true };

      // Transaction: update booking + payment + trừ phòng
      await this.prisma.$transaction(async (tx) => {
        await tx.booking.update({
          where: { id: bookingId },
          data: { status: 'confirmed' },
        });

        await tx.payment.update({
          where: { bookingId },
          data: { status: 'paid', transactionId: session.payment_intent },
        });

        await tx.hotel.update({
          where: { id: booking.hotelId },
          data: { availableRooms: { decrement: 1 } },
        });
      });

      console.log('🔥 Booking confirmed:', bookingId);

      // Gửi email xác nhận
      try {
        await this.mailService.sendBookingConfirmation({
          toEmail: booking.user.email,
          toName: booking.user.name || 'Khách hàng',
          hotelName: booking.hotel.name,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          totalPrice: booking.totalPrice,
          bookingId: booking.id,
        });
      } catch (mailErr) {
        console.log('⚠️ Email failed (non-critical):', mailErr.message);
      }
    }

    // ── Session hết hạn ────────────────────────────────────
    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;

      if (!bookingId) return { received: true };

      await this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'cancelled' },
      });

      await this.prisma.payment.update({
        where: { bookingId },
        data: { status: 'failed' },
      });

      console.log('⏰ Booking expired:', bookingId);
    }

    return { received: true };
  }
}