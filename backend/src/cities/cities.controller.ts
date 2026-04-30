import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/roles.guard';

@Controller('cities')
export class CitiesController {
  constructor(private citiesService: CitiesService) {}

  // Public
  @Get()
  findAll() {
    return this.citiesService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.citiesService.findOne(slug);
  }

  // Admin only
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post()
  create(@Body() dto: CreateCityDto) {
    return this.citiesService.create(dto);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateCityDto>) {
    return this.citiesService.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.citiesService.remove(id);
  }
}