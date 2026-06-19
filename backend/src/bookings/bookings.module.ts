import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingsCron } from './bookings.cron';

@Module({
  providers: [BookingsService, BookingsCron],
  controllers: [BookingsController],
})
export class BookingsModule {}
