import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { Repository } from 'typeorm';
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
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.itemsRepository.findAndCount({
      take: limit,
      skip: skip,
      order: {
        id: 'DESC',
      },
    });

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
