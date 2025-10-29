import { Module } from '@nestjs/common';
import { PlayerInventoryService } from './player-inventory.service';
import { PlayerInventoryController } from './player-inventory.controller';

@Module({
  controllers: [PlayerInventoryController],
  providers: [PlayerInventoryService],
})
export class PlayerInventoryModule {}
