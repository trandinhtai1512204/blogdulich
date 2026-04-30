// bookings.cron.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingsCron {
  private readonly logger = new Logger(BookingsCron.name);

  constructor(private prisma: PrismaService) {}

  // Chạy mỗi 5 phút
  @Cron(CronExpression.EVERY_5_MINUTES)
  async expireBookings() {
    const result = await this.prisma.booking.updateMany({
      where: {
        status: 'pending',
        expiresAt: { lt: new Date() },
      },
      data: { status: 'cancelled' },
    });

    if (result.count > 0) {
      this.logger.log(`⏰ Expired ${result.count} booking(s)`);
    }
  }
}