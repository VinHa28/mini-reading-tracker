import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ShelfService } from './shelf.service';
import { AddToShelfDTO } from './dto/add-to-shelf.dto';
import { ListShelfDTO } from './dto/list-shelf.dto';
import { ShelfBookIdParamDTO } from './dto/shelf-book-id-param.dto';

@Controller('shelf')
export class ShelfController {
  constructor(private readonly shelf: ShelfService) {}

  @Get()
  list(@Query() query: ListShelfDTO) {
    return this.shelf.list(query.status);
  }

  @Get('stats')
  stats() {
    return this.shelf.stats();
  }

  @Get(':shelfBookId')
  getById(@Param() params: ShelfBookIdParamDTO) {
    return this.shelf.findById(params.shelfBookId);
  }

  @Post()
  add(@Body() dto: AddToShelfDTO) {
    return this.shelf.add(dto);
  }
}
