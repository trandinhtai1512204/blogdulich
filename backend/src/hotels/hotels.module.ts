import { Module } from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { HotelsController } from './hotels.controller';

@Module({
  providers: [HotelsService],
  controllers: [HotelsController],
})
export class HotelsModule {}
