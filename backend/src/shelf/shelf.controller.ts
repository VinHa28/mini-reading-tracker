import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ShelfService } from './shelf.service';
import { AddToShelfDTO } from './dto/add-to-shelf.dto';
import { ListShelfDTO } from './dto/list-shelf.dto';
import { ShelfBookIdParamDTO } from './dto/shelf-book-id-param.dto';
import { UpdateShelfDTO } from './dto/update-shelf.dto';

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

  @Patch(':shelfBookId')
  updateById(
    @Param() params: ShelfBookIdParamDTO,
    @Body() dto: UpdateShelfDTO,
  ) {
    return this.shelf.update(params.shelfBookId, dto);
  }

  @Delete(':shelfBookId')
  @HttpCode(204)
  remove(@Param() params: ShelfBookIdParamDTO) {
    return this.shelf.remove(params.shelfBookId);
  }

  @Post()
  add(@Body() dto: AddToShelfDTO) {
    return this.shelf.add(dto);
  }
}
