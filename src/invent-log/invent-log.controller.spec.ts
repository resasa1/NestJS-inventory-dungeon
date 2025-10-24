import { Test, TestingModule } from '@nestjs/testing';
import { InventLogController } from './invent-log.controller';
import { InventLogService } from './invent-log.service';

describe('InventLogController', () => {
  let controller: InventLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventLogController],
      providers: [InventLogService],
    }).compile();

    controller = module.get<InventLogController>(InventLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
