import { Injectable } from '@nestjs/common';
import { CreateInventLogDto } from './dto/create-invent-log.dto';
import { UpdateInventLogDto } from './dto/update-invent-log.dto';

@Injectable()
export class InventLogService {
  create(createInventLogDto: CreateInventLogDto) {
    return 'This action adds a new inventLog';
  }

  findAll() {
    return `This action returns all inventLog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} inventLog`;
  }

  update(id: number, updateInventLogDto: UpdateInventLogDto) {
    return `This action updates a #${id} inventLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} inventLog`;
  }
}
