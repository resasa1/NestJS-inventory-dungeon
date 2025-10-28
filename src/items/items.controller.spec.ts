import { Test, TestingModule } from '@nestjs/testing';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { PaginationDto } from '../pagination.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

const mockItemsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ItemsController', () => {
  let controller: ItemsController;
  let service: ItemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsController],
      providers: [
        {
          provide: ItemsService,
          useValue: mockItemsService,
        },
      ],
    }).compile();

    controller = module.get<ItemsController>(ItemsController);
    service = module.get<ItemsService>(ItemsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  describe('create', () => {
    it('should create an item', async () => {
      const createDto: CreateItemDto = { sku: 'TEST-001', name: 'Test Item' };
      const expectedResult = { id: 1, ...createDto, quantity: 0 };

      // Atur tiruan: Saat 'create' dipanggil, kembalikan 'expectedResult'
      mockItemsService.create.mockResolvedValue(expectedResult);

      // Panggil method controller
      const result = await controller.create(createDto);

      // Cek: Apakah controller mengembalikan hasil yang benar?
      expect(result).toEqual(expectedResult);
      // Cek: Apakah service.create dipanggil dengan DTO yang benar?
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  // Tes 3: 'findAll()'
  describe('findAll', () => {
    it('should return paginated items', async () => {
      const query: PaginationDto = { page: 1, limit: 10 };
      const expectedResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      // Atur tiruan
      mockItemsService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(query);

      // Cek
      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  // Tes 4: 'findOne()'
  describe('findOne', () => {
    it('should return a single item by id', async () => {
      const expectedResult = { id: 1, sku: 'TEST-001', name: 'Test Item' };

      // Atur tiruan
      mockItemsService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(1); // '1' adalah ID

      // Cek
      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  // Tes 5: 'update()'
  describe('update', () => {
    it('should update an item', async () => {
      const updateDto: UpdateItemDto = { name: 'Updated Name' };
      const expectedResult = { id: 1, sku: 'TEST-001', name: 'Updated Name' };

      // Atur tiruan
      mockItemsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(1, updateDto);

      // Cek
      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  // Tes 6: 'remove()'
  describe('remove', () => {
    it('should remove an item', async () => {
      const expectedResult = { message: 'Item with ID 1 has been soft-deleted' };

      // Atur tiruan
      mockItemsService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(1);

      // Cek
      expect(result).toEqual(expectedResult);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
