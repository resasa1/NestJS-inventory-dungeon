/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { Repository, ILike, FindManyOptions } from 'typeorm'; 
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PaginationDto } from '../pagination.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private itemsRepository: Repository<Item>,
  ) {}

  async create(createItemDto: CreateItemDto): Promise<Item> {
    const existingItem = await this.itemsRepository.findOneBy({
      sku: createItemDto.sku,
    });
    if (existingItem) {
      throw new BadRequestException(`Item with this SKU ${createItemDto.sku} already exists`);
    }

    const newItem = this.itemsRepository.create(createItemDto);
    return this.itemsRepository.save(newItem);
  }

  async findAll(paginationDto: PaginationDto) {
    // 1. Destrukturisasi semua properti, termasuk 'search'
    const { page, limit, search } = paginationDto;
    const skip = (page - 1) * limit;

    // 2. Siapkan opsi query dasar
    const queryOptions: FindManyOptions<Item> = {
      take: limit,
      skip: skip,
      order: {
        id: 'DESC',
      },
    };

    // 3. Tambahkan 'where' HANYA JIKA ada query pencarian
    if (search) {
      const searchQuery = `%${search.toLowerCase()}%`; // Gunakan % untuk pencarian substring
      queryOptions.where = [
        // 'where' dalam bentuk array berarti 'OR'
        { name: ILike(searchQuery) }, // ILike = case-insensitive LIKE
        { sku: ILike(searchQuery) },
      ];
    }

    // 4. Jalankan query dengan opsi yang telah dibuat
    const [data, total] = await this.itemsRepository.findAndCount(queryOptions);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return item;
  }

  async update(id: number, updateItemDto: UpdateItemDto): Promise<Item> {
    const item = await this.itemsRepository.preload({
      id: id,
      ...updateItemDto,
    });
    if (!item) {
      throw new NotFoundException(`item with ID {id} not found`);
    }

    try {
      return await this.itemsRepository.save(item);
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException(`Item with SKU ${updateItemDto.sku} is already exists`);
      }
      throw error;
    }
  }
  async remove(id: number): Promise<{ message: string }> {
    const result = await this.itemsRepository.softDelete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
    return { message: `Item with ID ${id} has been soft-deleted` };
  }
}
