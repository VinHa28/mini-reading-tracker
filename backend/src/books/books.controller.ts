import { Controller, Get, Param, Query } from '@nestjs/common';
import { SearchBooksDTO } from './dto/search-books.dto';
import { WorkIdParamDTO } from './dto/work-id-param.dto';
import { BooksService } from './books.service';

@Controller('books')
export class BooksController {
  constructor(private readonly books: BooksService) {}

  @Get('search')
  search(@Query() query: SearchBooksDTO) {
    return this.books.search(query.q, query.page);
  }

  @Get(':workId')
  getOne(@Param() params: WorkIdParamDTO) {
    return this.books.getOne(params.workId);
  }
}
