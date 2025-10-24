import { InventoryLog } from '../../invent-log/entities/invent-log.entity';
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

  @Column()
  


}