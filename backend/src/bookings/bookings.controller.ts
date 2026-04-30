// bookings.controller.ts
import { Controller, Post, Get, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('bookings')
export class BookingsController {
  constructor(private bookingService: BookingsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Req() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingService.create(req.user.sub, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my')
  getMyBookings(@Req() req: any) {
    return this.bookingService.getMyBookings(req.user.sub);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  cancel(@Param('id') id: string, @Req() req: any) {
    return this.bookingService.cancel(id, req.user.sub);
  }
}