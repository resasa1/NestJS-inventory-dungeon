/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Item } from '../../items/entities/item.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class PlayerInventory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @ManyToOne(() => User, (user) => user.inventory)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Item, (item) => item.inventory)
  @JoinColumn({ name: 'itemId' })
  item: Item;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updateAt: Date;
}

