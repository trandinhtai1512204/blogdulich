import { Controller, Get, Query } from '@nestjs/common';
import { TaxonomyService } from './taxonomy.service';

@Controller('taxonomy')
export class TaxonomyController {
  constructor(private taxonomy: TaxonomyService) {}

  /**
   * GET /api/taxonomy/resolve?path=review/tour/ha-noi/review-tour-2025
   */
  @Get('resolve')
  async resolve(@Query('path') path: string) {
    const slugs = (path || '')
      .split('/')
      .map((s) => s.trim())
      .filter(Boolean);
    return this.taxonomy.resolve(slugs);
  }

  /**
   * GET /api/taxonomy/page?path=...
   * Returns resolved taxonomy + children + posts in one call (no client waterfall).
   */
  @Get('page')
  async page(@Query('path') path: string) {
    const slugs = (path || '')
      .split('/')
      .map((s) => s.trim())
      .filter(Boolean);
    return this.taxonomy.resolvePage(slugs);
  }
}
