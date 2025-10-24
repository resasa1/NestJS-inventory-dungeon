import { Test, TestingModule } from '@nestjs/testing';
import { InventLogService } from './invent-log.service';

describe('InventLogService', () => {
  let service: InventLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InventLogService],
    }).compile();

    service = module.get<InventLogService>(InventLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
