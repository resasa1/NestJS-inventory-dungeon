import { 
  Controller, Get, Post, Body, 
  Param, ParseIntPipe, Query 
} from '@nestjs/common';
import { InventoryLogsService } from './invent-log.service';
import { CreateLogDto } from './dto/create-invent-log.dto';
import { PaginationDto } from '../pagination.dto';

@Controller('inventory-logs')
export class InventoryLogsController {
  constructor(private readonly inventoryLogsService: InventoryLogsService) {}

  @Post()
  create(@Body() createLogDto: CreateLogDto) {
    return this.inventoryLogsService.createLog(createLogDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.inventoryLogsService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryLogsService.findOne(id);
  }
}
