import { Test, TestingModule } from '@nestjs/testing';
import { PlayerInventoryService } from './player-inventory.service';

describe('PlayerInventoryService', () => {
  let service: PlayerInventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlayerInventoryService],
    }).compile();

    service = module.get<PlayerInventoryService>(PlayerInventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
