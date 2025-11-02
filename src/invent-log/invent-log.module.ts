import { Module } from '@nestjs/common';
import { InventoryLogsService } from './invent-log.service';
import { InventoryLogsController } from './invent-log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryLog } from './entities/invent-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryLog])],
  controllers: [InventoryLogsController],
  providers: [InventoryLogsService],
  exports: [InventoryLogsService],
})
export class InventLogModule {}
