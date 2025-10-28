// src/inventory-logs/inventory-logs.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InventoryLogsService } from './invent-log.service';
import { InventoryLog, LogType } from './entities/invent-log.entity';
import { Item } from '../items/entities/item.entity';
import { User } from '../users/entities/user.entity';
import { CreateLogDto } from './dto/create-invent-log.dto';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = (): MockRepository => ({
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
});

const createMockEntityManager = () => ({
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

describe('InventoryLogsService', () => {
  let service: InventoryLogsService;
  let logRepository: MockRepository<InventoryLog>;
  let itemRepository: MockRepository<Item>;
  let userRepository: MockRepository<User>;
  let dataSource: jest.Mocked<DataSource>;
  let mockEntityManager: ReturnType<typeof createMockEntityManager>;

  beforeEach(async () => {
    mockEntityManager = createMockEntityManager();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryLogsService,
        {
          provide: getRepositoryToken(InventoryLog),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Item),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn().mockImplementation(async (callback) => {
              return callback(mockEntityManager);
            }),
          },
        },
      ],
    }).compile();

    service = module.get<InventoryLogsService>(InventoryLogsService);
    logRepository = module.get(getRepositoryToken(InventoryLog));
    itemRepository = module.get(getRepositoryToken(Item));
    userRepository = module.get(getRepositoryToken(User));
    dataSource = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Tes CREATE LOG
  describe('createLog', () => {
    let createLogDto: CreateLogDto;
    let mockUser: User;
    let mockItem: Item;

    beforeEach(() => {
      // Reset tiruan sebelum tiap tes 'createLog'
      mockEntityManager.findOneBy.mockReset();
      mockEntityManager.save.mockReset();
      mockEntityManager.update.mockReset();
      mockEntityManager.create.mockReset();

      createLogDto = {
        itemId: 1,
        userId: 1,
        type: LogType.IN,
        quantity: 10,
        reason: 'Test stock in',
      };

      mockUser = { id: 1, name: 'Test User' } as User;
      mockItem = { id: 1, name: 'Test Item', quantity: 5 } as Item;

      mockEntityManager.findOneBy
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockItem);
    });

    // Tes 1: STOK MASUK (IN)
    it('should create an IN log and update item quantity correctly', async () => {
      const mockLog = { id: 1, ...createLogDto } as any;

      mockEntityManager.create.mockReturnValue(mockLog);
      mockEntityManager.save.mockResolvedValue(mockLog);

      const result = await service.createLog(createLogDto);

      // 1. Cek transaksi dipanggil
      expect(dataSource.transaction).toHaveBeenCalled();

      // 2. Cek User dan Item dicari
      expect(mockEntityManager.findOneBy).toHaveBeenCalledWith(User, { id: 1 });
      expect(mockEntityManager.findOneBy).toHaveBeenCalledWith(Item, { id: 1 });

      // 3. Cek Log dibuat
      expect(mockEntityManager.create).toHaveBeenCalledWith(InventoryLog, {
        item: mockItem,
        user: mockUser,
        type: LogType.IN,
        quantity_changed: 10,
        reason: 'Test stock in',
      });
      expect(mockEntityManager.save).toHaveBeenCalledWith(mockLog);

      expect(mockEntityManager.update).toHaveBeenCalledWith(Item, mockItem.id, {
        quantity: 15,
      });

      expect(result).toEqual(mockLog);
    });

    // Tes 2: STOK KELUAR (OUT) - SUKSES
    it('should create an OUT log and update item quantity correctly', async () => {
      createLogDto.type = LogType.OUT;
      createLogDto.quantity = 3;

      await service.createLog(createLogDto);

      expect(mockEntityManager.create).toHaveBeenCalledWith(InventoryLog, expect.objectContaining({ 
        quantity_changed: -3,
      }));
      expect(mockEntityManager.update).toHaveBeenCalledWith(Item, mockItem.id, {
        quantity: 2,
      });
    });

    // Tes 3: STOK KELUAR (OUT) - GAGAL (Stok Kurang)
    it('should throw BadRequestException if stock is insufficient for OUT log', async () => {
      createLogDto.type = LogType.OUT;
      createLogDto.quantity = 10;

      await expect(service.createLog(createLogDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockEntityManager.save).not.toHaveBeenCalled();
      expect(mockEntityManager.update).not.toHaveBeenCalled();
    });

    // Tes 4: GAGAL (Item tidak ditemukan)
    it('should throw NotFoundException if item not found', async () => {
      mockEntityManager.findOneBy.mockReset();
      mockEntityManager.findOneBy
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(null);

      await expect(service.createLog(createLogDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // Tes FIND ALL (PAGINATION)
  describe('findAll', () => {
    it('should return paginated logs with relations', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const mockUser = { id: 1, name: 'Test', email: 'test@test.com', password: 'hash' };
      const mockLog = { 
        id: 1, 
        type: LogType.IN, 
        quantity_changed: 10, 
        user: mockUser 
      } as InventoryLog;

      const expectedLogResult = {
        ...mockLog,
        user: { id: 1, name: 'Test', email: 'test@test.com' }
      };

      logRepository.findAndCount.mockResolvedValue([[mockLog], 1]);

      const result = await service.findAll(paginationDto);

      expect(logRepository.findAndCount).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        order: { createdAt: 'DESC' },
        relations: ['item', 'user'],
      });
      expect(result.data).toEqual([expectedLogResult]);
      expect(result.total).toBe(1);
    });
  });
});
