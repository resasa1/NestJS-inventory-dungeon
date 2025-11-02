/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PlayerInventory } from './entities/player-inventory.entity';
import { User } from '../users/entities/user.entity';
import { Item } from '../items/entities/item.entity';
import { InventoryLogsService } from '../invent-log/invent-log.service';
import { CreateLogDto } from '../invent-log/dto/create-invent-log.dto';
import { LogType } from '../invent-log/entities/invent-log.entity';

@Injectable()
export class PlayerInventoryService {
  constructor(
    @InjectRepository(PlayerInventory)
    private inventoryRepository: Repository<PlayerInventory>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Item)
    private itemsRepository: Repository<Item>,
    private readonly logsService: InventoryLogsService,
    private dataSource: DataSource,
  ) {}

  async findInventoryForUser(userId: number): Promise<PlayerInventory[]> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.inventoryRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['item'],
      withDeleted: true,
    });
  }

  async handleItemChange(createLogDto: CreateLogDto) {
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
      
      const log = await this.logsService.createLog(createLogDto, user, item, quantityChanged, transactionalEntityManager);
      return log;
    });
  }
}