/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item]),
    UsersModule,
  ],
  controllers: [ItemsController],
  providers: [ItemsService],
  exports: [TypeOrmModule.forFeature([Item])],
})
export class ItemsModule{}