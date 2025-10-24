import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InventLogService } from './invent-log.service';
import { CreateInventLogDto } from './dto/create-invent-log.dto';
import { UpdateInventLogDto } from './dto/update-invent-log.dto';

@Controller('invent-log')
export class InventLogController {
  constructor(private readonly inventLogService: InventLogService) {}

  @Post()
  create(@Body() createInventLogDto: CreateInventLogDto) {
    return this.inventLogService.create(createInventLogDto);
  }

  @Get()
  findAll() {
    return this.inventLogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventLogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInventLogDto: UpdateInventLogDto) {
    return this.inventLogService.update(+id, updateInventLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventLogService.remove(+id);
  }
}
