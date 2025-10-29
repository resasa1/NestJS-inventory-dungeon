import { Test, TestingModule } from '@nestjs/testing';
import { InventoryLogsController } from './invent-log.controller';
import { InventoryLogsService } from './invent-log.service';
import { PaginationDto } from '../pagination.dto';
import { CreateLogDto } from './dto/create-invent-log.dto';
import { LogType } from './entities/invent-log.entity';

const mockInventoryLogsService = {
  createLog: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
};

describe('InventoryLogsController', () => {
  let controller: InventoryLogsController;
  let service: InventoryLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryLogsController],
      providers: [
        {
          provide: InventoryLogsService,
          useValue: mockInventoryLogsService,
        },
      ],
    }).compile();

    controller = module.get<InventoryLogsController>(InventoryLogsController);
    service = module.get<InventoryLogsService>(InventoryLogsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Tes 1: 'should be defined'
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Tes 2: 'create()'
  describe('create', () => {
    it('should create a log', async () => {
      const createDto: CreateLogDto = {
        itemId: 1,
        userId: 1,
        type: LogType.IN,
        quantity: 10,
      };
      const expectedResult = { id: 1, ...createDto };

      mockInventoryLogsService.createLog.mockResolvedValue(expectedResult);
      const result = await controller.create(createDto);

      // Cek
      expect(result).toEqual(expectedResult);
      expect(service.createLog).toHaveBeenCalledWith(createDto);
    });
  });

  // Tes 3: 'findAll()'
  describe('findAll', () => {
    it('should return paginated logs', async () => {
      const query: PaginationDto = { page: 1, limit: 10 };
      const expectedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockInventoryLogsService.findAll.mockResolvedValue(expectedResult);
      const result = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  // Tes 4: 'findOne()'
  describe('findOne', () => {
    it('should return a single log by id', async () => {
      const expectedResult = { id: 1, type: LogType.IN, quantity_changed: 10 };

      mockInventoryLogsService.findOne.mockResolvedValue(expectedResult);
      const result = await controller.findOne(1); // '1' adalah ID

      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });
});
