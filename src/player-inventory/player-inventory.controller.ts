import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { PlayerInventoryService } from './player-inventory.service';
import { CreateLogDto } from '../invent-log/dto/create-invent-log.dto';

@Controller('inventory')
export class PlayerInventoryController {
  constructor(private readonly inventoryService: PlayerInventoryService) {}

  @Get('user/:userId')
  findInventoryForUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.inventoryService.findInventoryForUser(userId);
  }

  @Post('loot')
  lootItem(@Body() createLogDto: CreateLogDto) {
    return this.inventoryService.handleItemChange(createLogDto);
  }
}
