import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/roles.guard';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  // Public
  @Get()
  findAll(@Query() query: QueryPostsDto) {
    return this.postsService.findAll(query);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.postsService.findOne(slug);
  }

  // Admin only
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post()
  create(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreatePostDto>) {
    return this.postsService.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}