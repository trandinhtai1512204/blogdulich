import { Controller, Get, Query } from '@nestjs/common';
import { TaxonomyService } from './taxonomy.service';

@Controller('taxonomy')
export class TaxonomyController {
  constructor(private taxonomy: TaxonomyService) {}

  /**
   * GET /api/taxonomy/resolve?path=review-tour/tieu-muc-1/bai-viet-1
   */
  @Get('resolve')
  async resolve(@Query('path') path: string) {
    const slugs = (path || '')
      .split('/')
      .map((s) => s.trim())
      .filter(Boolean);
    return this.taxonomy.resolve(slugs);
  }
}

