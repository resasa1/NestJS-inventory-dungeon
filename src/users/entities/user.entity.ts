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
  Index,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Index({ unique: true })
  @Column()
  email: string;

  @Column({ select: false })
  password: string;

  @OneToMany(() => InventoryLog, (log) => log.user)
  logs: InventoryLog[];

  @OneToMany(() => PlayerInventory, (inventory) => inventory.user)
  inventory: PlayerInventory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
