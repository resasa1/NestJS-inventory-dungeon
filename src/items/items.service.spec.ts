// src/items/items.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';
import { PaginationDto } from '../pagination.dto';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = (): MockRepository<Item> => ({
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  findAndCount: jest.fn(),
  preload: jest.fn(),
  softDelete: jest.fn(),
});

describe('ItemsService', () => {
  let service: ItemsService;
  let repository: MockRepository<Item>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        {
          provide: getRepositoryToken(Item),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
    repository = module.get<MockRepository<Item>>(getRepositoryToken(Item));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return an item', async () => {
      const createItemDto = { sku: 'SKU-001', name: 'Test Item', quantity: 10 };
      const mockItem = { id: 1, ...createItemDto } as Item;

      // Atur tiruan: findOneBy (cek duplikat) mengembalikan null (aman)
      repository.findOneBy.mockResolvedValue(null);
      // Atur tiruan: create
      repository.create.mockReturnValue(mockItem);
      // Atur tiruan: save
      repository.save.mockResolvedValue(mockItem);

      const result = await service.create(createItemDto);

      expect(result).toEqual(mockItem);
      expect(repository.findOneBy).toHaveBeenCalledWith({ sku: 'SKU-001' });
      expect(repository.save).toHaveBeenCalledWith(mockItem);
    });

    it('should throw BadRequestException if SKU already exists', async () => {
      const createItemDto = { sku: 'SKU-001', name: 'Test Item', quantity: 10 };
      const existingItem = { id: 1, ...createItemDto } as Item;

      repository.findOneBy.mockResolvedValue(existingItem);

      await expect(service.create(createItemDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('should find and return an item by id', async () => {
      const mockItem = { id: 1, sku: 'SKU-001', name: 'Test Item' } as Item;
      repository.findOneBy.mockResolvedValue(mockItem);

      const result = await service.findOne(1);
      expect(result).toEqual(mockItem);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException if item not found', async () => {
      repository.findOneBy.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated items', async () => {
      const paginationDto: PaginationDto = { page: 1, limit: 10 };
      const mockItems = [{ id: 1, sku: 'SKU-001', name: 'Test Item' } as Item];
      const total = 1;

      repository.findAndCount.mockResolvedValue([mockItems, total]);

      const result = await service.findAll(paginationDto);

      expect(result.data).toEqual(mockItems);
      expect(result.total).toEqual(total);
      expect(result.page).toEqual(1);
      expect(repository.findAndCount).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        order: { id: 'DESC' },
      });
    });
  });

  // Tes UPDATE
  describe('update', () => {
    it('should update and return an item', async () => {
      const updateItemDto = { name: 'Updated Name' };
      const existingItem = { id: 1, sku: 'SKU-001', name: 'Old Name' } as Item;
      const updatedItem = { ...existingItem, ...updateItemDto };

      repository.preload.mockResolvedValue(updatedItem);
      repository.save.mockResolvedValue(updatedItem);

      const result = await service.update(1, updateItemDto);

      expect(repository.preload).toHaveBeenCalledWith({
        id: 1,
        ...updateItemDto,
      });
      expect(repository.save).toHaveBeenCalledWith(updatedItem);
      expect(result).toEqual(updatedItem);
    });

    it('should throw NotFoundException if item to update not found', async () => {
      repository.preload.mockResolvedValue(null); // 'preload' gagal
      await expect(service.update(99, { name: 'Fail' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete an item and return a message', async () => {
      repository.softDelete.mockResolvedValue({ affected: 1 });
      const result = await service.remove(1);

      expect(repository.softDelete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Item with ID 1 has been soft-deleted' });
    });

    it('should throw NotFoundException if item to delete not found', async () => {
      repository.softDelete.mockResolvedValue({ affected: 0 });
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
