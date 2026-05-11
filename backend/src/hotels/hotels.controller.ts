import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { QueryHotelsDto } from './dto/query-hotels.dto';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { AdminGuard } from '../auth/roles.guard';

@Controller('hotels')
export class HotelsController {
  constructor(private hotelsService: HotelsService) {}

  // Public
  @Get()
  findAll(@Query() query: QueryHotelsDto) {
    return this.hotelsService.findAll(query);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.hotelsService.findOne(slug);
  }

  // Admin only
  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @Post()
  create(@Body() dto: CreateHotelDto) {
    return this.hotelsService.create(dto);
  }

  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateHotelDto>) {
    return this.hotelsService.update(id, dto);
  }

  @UseGuards(SupabaseAuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hotelsService.remove(id);
  }
}