import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlayerInventoryService } from './player-inventory.service';
import { CreatePlayerInventoryDto } from './dto/create-player-inventory.dto';
import { UpdatePlayerInventoryDto } from './dto/update-player-inventory.dto';

@Controller('player-inventory')
export class PlayerInventoryController {
  constructor(private readonly playerInventoryService: PlayerInventoryService) {}

  @Post()
  create(@Body() createPlayerInventoryDto: CreatePlayerInventoryDto) {
    return this.playerInventoryService.create(createPlayerInventoryDto);
  }

  @Get()
  findAll() {
    return this.playerInventoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playerInventoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlayerInventoryDto: UpdatePlayerInventoryDto) {
    return this.playerInventoryService.update(+id, updatePlayerInventoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.playerInventoryService.remove(+id);
  }
}
