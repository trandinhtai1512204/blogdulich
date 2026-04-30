import { Controller, Post, Get, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('hotel/:hotelId')
  create(@Param('hotelId') hotelId: string, @Req() req: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(req.user.sub, hotelId, dto);
  }

  @Get('hotel/:hotelId')
  findByHotel(@Param('hotelId') hotelId: string) {
    return this.reviewsService.findByHotel(hotelId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: any) {
    return this.reviewsService.delete(id, req.user.sub);
  }
}