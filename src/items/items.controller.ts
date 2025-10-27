import { 
  Controller, Get, Post, Body, 
  Patch, Param, Delete, ParseIntPipe, Query
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PaginationDto } from '../pagination.dto';

@Controller('items') // Base URL: /items
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post() // POST /items
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemsService.create(createItemDto);
  }

  @Get() // GET /items
  findAll(@Query() paginationDto: PaginationDto) {
    return this.itemsService.findAll(paginationDto);
  }

  @Get(':id') // GET /items/1
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.findOne(id);
  }

  @Patch(':id') // PATCH /items/1
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateItemDto: UpdateItemDto
  ) {
    return this.itemsService.update(id, updateItemDto);
  }

  @Delete(':id') // DELETE /items/1
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.remove(id);
  }
}