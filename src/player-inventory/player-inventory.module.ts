import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerInventory } from './entities/player-inventory.entity';
import { PlayerInventoryController } from './player-inventory.controller';
import { PlayerInventoryService } from './player-inventory.service';
import { InventLogModule } from '../invent-log/invent-log.module';
import { UsersModule } from '../users/users.module';
import { ItemsModule } from '../items/items.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlayerInventory]),
    UsersModule,
    ItemsModule,
    InventLogModule,
  ],
  controllers: [PlayerInventoryController],
  providers: [PlayerInventoryService],
  exports: [PlayerInventoryService],
})
export class PlayerInventoryModule {}
