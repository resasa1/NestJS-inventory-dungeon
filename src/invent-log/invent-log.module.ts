import { Module } from '@nestjs/common';
import { InventLogService } from './invent-log.service';
import { InventLogController } from './invent-log.controller';

@Module({
  controllers: [InventLogController],
  providers: [InventLogService],
})
export class InventLogModule {}
