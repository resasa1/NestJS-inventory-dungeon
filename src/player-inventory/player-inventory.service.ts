import { Injectable } from '@nestjs/common';
import { CreatePlayerInventoryDto } from './dto/create-player-inventory.dto';
import { UpdatePlayerInventoryDto } from './dto/update-player-inventory.dto';

@Injectable()
export class PlayerInventoryService {
  create(createPlayerInventoryDto: CreatePlayerInventoryDto) {
    return 'This action adds a new playerInventory';
  }

  findAll() {
    return `This action returns all playerInventory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} playerInventory`;
  }

  update(id: number, updatePlayerInventoryDto: UpdatePlayerInventoryDto) {
    return `This action updates a #${id} playerInventory`;
  }

  remove(id: number) {
    return `This action removes a #${id} playerInventory`;
  }
}
