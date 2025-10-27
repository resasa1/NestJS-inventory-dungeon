import { Module } from '@nestjs/common';
import { InventoryLogsService } from './invent-log.service';
import { InventoryLogsController } from './invent-log.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryLog } from './entities/invent-log.entity';
import { Item } from '../items/entities/item.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryLog, Item, User])],
  controllers: [InventoryLogsController],
  providers: [InventoryLogsService],
})
export class InventLogModule {}
