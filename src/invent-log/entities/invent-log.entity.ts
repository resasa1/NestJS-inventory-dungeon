import { User } from '../../users/entities/user.entity';
import { Item } from '../../items/entities/item.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';

export enum LogType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
}

@Entity()
export class InventoryLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: LogType })
  type: LogType;

  @Column()
  quantity_changed: number;

  @Column({ nullable: true })
  reason: string;

  @ManyToOne(() => Item, (item) => item.logs)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @ManyToOne(() => User, (user) => user.logs)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
