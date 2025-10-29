import { Test, TestingModule } from '@nestjs/testing';
import { PlayerInventoryController } from './player-inventory.controller';
import { PlayerInventoryService } from './player-inventory.service';

describe('PlayerInventoryController', () => {
  let controller: PlayerInventoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayerInventoryController],
      providers: [PlayerInventoryService],
    }).compile();

    controller = module.get<PlayerInventoryController>(PlayerInventoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
