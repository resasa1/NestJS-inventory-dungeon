/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { InventoryLog } from './entities/invent-log.entity';
import { CreateLogDto } from './dto/create-invent-log.dto';
import { PaginationDto } from '../pagination.dto';
import { User } from '../users/entities/user.entity';
import { Item } from '../items/entities/item.entity';

@Injectable()
export class InventoryLogsService {
  constructor(
    @InjectRepository(InventoryLog)
    private logsRepository: Repository<InventoryLog>,
  ) {}

  async createLog(
    createLogDto: CreateLogDto,
    user: User,
    item: Item,
    quantityChanged: number,
    transactionalEntityManager: EntityManager,
  ) {
    const newLog = transactionalEntityManager.create(InventoryLog, {
      item: item,
      user: user,
      type: createLogDto.type,
      quantity_changed: quantityChanged,
      reason: createLogDto.reason,
    });
    return transactionalEntityManager.save(newLog);
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.logsRepository.findAndCount({
      take: limit,
      skip: skip,
      order: {
        createdAt: 'DESC',
      },
      relations: ['item', 'user'],
    });

    return {
      data: data.map(log => ({
        ...log,
        user: log.user ? { id: log.user.id, name: log.user.name, email: log.user.email } : null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const log = await this.logsRepository.findOne({
      where: { id },
      relations: ['item', 'user'],
    });

    if (!log) {
      throw new NotFoundException(`Log with ID ${id} not found`);
    }

    const { password, ...userWithoutPassword } = log.user || {};
    
    return {
      ...log,
      user: log.user ? userWithoutPassword : null,
    };
  }
}