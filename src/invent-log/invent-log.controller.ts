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

  @Post() // POST /inventory-logs
  create(@Body() createLogDto: CreateLogDto) {
    return this.inventoryLogsService.createLog(createLogDto);
  }

  @Get() // GET /inventory-logs?page=1&limit=10
  findAll(@Query() paginationDto: PaginationDto) {
    return this.inventoryLogsService.findAll(paginationDto);
  }

  @Get(':id') // GET /inventory-logs/1
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryLogsService.findOne(id);
  }

  // Kita tidak menyediakan endpoint PATCH atau DELETE untuk log.
}
