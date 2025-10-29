/* eslint-disable prettier/prettier */
import { InventoryLog } from '../../invent-log/entities/invent-log.entity';
import { PlayerInventory } from '../../player-inventory/entities/player-inventory.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToMany,
    Index
} from 'typeorm';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  sku: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => InventoryLog, (log) => log.item)
  logs: InventoryLog[];

  @OneToMany(() => PlayerInventory, (inventory) => inventory.item)
  inventory: PlayerInventory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
