import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ShelfService } from './shelf.service';
import { AddToShelfDTO } from './dto/add-to-shelf.dto';
import { query } from 'axios';
import { ListShelfDto } from './dto/list-shelf.dto';

@Controller('shelf')
export class ShelfController {
  constructor(private readonly shelf: ShelfService) {}

  @Get()
  list(@Query() query: ListShelfDto) {
    return this.shelf.list(query.status);
  }

  @Get('stats')
  stats() {
    return this.shelf.stats();
  }

  @Post()
  add(@Body() dto: AddToShelfDTO) {
    return this.shelf.add(dto);
  }
}
