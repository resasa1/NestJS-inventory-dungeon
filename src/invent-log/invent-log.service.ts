import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { InventoryLog, LogType } from './entities/invent-log.entity';
import { Item } from '../items/entities/item.entity';
import { User } from '../users/entities/user.entity';
import { CreateLogDto } from './dto/create-invent-log.dto';
import { PaginationDto } from '../pagination.dto';
import { PlayerInventory } from '../player-inventory/entities/player-inventory.entity';

@Injectable()
export class InventoryLogsService {
  constructor(
    @InjectRepository(InventoryLog)
    private logsRepository: Repository<InventoryLog>,
    @InjectRepository(Item)
    private itemsRepository: Repository<Item>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(PlayerInventory)
    private inventoryRepository: Repository<PlayerInventory>,
    private dataSource: DataSource,
  ) {}

  async createLog(createLogDto: CreateLogDto) {
    const { itemId, userId, type, quantity, reason } = createLogDto;

    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const user = await transactionalEntityManager.findOneBy(User, { id: userId });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const item = await transactionalEntityManager.findOneBy(Item, { id: itemId });
      if (!item) {
        throw new NotFoundException(`Item with ID ${itemId} not found`);
      }

      let playerInventoryItem = await transactionalEntityManager.findOne(PlayerInventory, {
        where: {
          user: { id: userId },
          item: { id: itemId },
        },
      });

      let currentQuantity = playerInventoryItem ? playerInventoryItem.quantity : 0;
      let newQuantity = currentQuantity;
      let quantityChanged = 0;

      if (type === LogType.IN) {
        newQuantity += quantity;
        quantityChanged = +quantity;
      } else if (type === LogType.OUT) {
        if (currentQuantity < quantity) {
          throw new BadRequestException(`Not enough ${item.name} in inventory.`);
        }
        newQuantity -= quantity;
        quantityChanged = -quantity;
      } else if (type === LogType.ADJUSTMENT) {
        quantityChanged = quantity - currentQuantity;
        newQuantity = quantity;
      }

      if (playerInventoryItem) {
        if (newQuantity > 0) {
          await transactionalEntityManager.update(PlayerInventory, playerInventoryItem.id, {
            quantity: newQuantity,
          });
        } else {
          await transactionalEntityManager.remove(PlayerInventory, playerInventoryItem);
        }
      } else if (newQuantity > 0) {
        playerInventoryItem = transactionalEntityManager.create(PlayerInventory, {
          user: user,
          item: item,
          quantity: newQuantity,
        });
        await transactionalEntityManager.save(playerInventoryItem);
      } else if (newQuantity < 0) {
         throw new BadRequestException(`Cannot take ${item.name} which does not exist in inventory.`);
      }
      
      const newLog = transactionalEntityManager.create(InventoryLog, {
        item: item,
        user: user,
        type: type,
        quantity_changed: quantityChanged,
        reason: reason,
      });
      await transactionalEntityManager.save(newLog);

      return newLog;
    });
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