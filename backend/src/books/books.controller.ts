import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiGatewayTimeoutResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SearchBooksDTO } from './dto/search-books.dto';
import { WorkIdParamDTO } from './dto/work-id-param.dto';
import { BooksService } from './books.service';
import {
  BookDetailResponseDto,
  BookSearchResponseDto,
} from './dto/book-response.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

@ApiTags('books')
@ApiBadGatewayResponse({
  type: ErrorResponseDto,
  description: 'Open Library không phản hồi được',
})
@ApiGatewayTimeoutResponse({
  type: ErrorResponseDto,
  description: 'Open Library phản hồi quá chậm',
})
@Controller('books')
export class BooksController {
  constructor(private readonly books: BooksService) {}

  @Get('search')
  @ApiOperation({
    summary: 'Tìm sách trên Open Library (có phân trang)',
    description:
      'Mỗi sách kèm cờ inShelf và shelfBookId để biết đã có trong tủ chưa.',
  })
  @ApiOkResponse({ type: BookSearchResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'q rỗng hoặc page sai',
  })
  search(@Query() query: SearchBooksDTO) {
    return this.books.search(query.q, query.page);
  }

  @Get(':workId')
  @ApiOperation({ summary: 'Chi tiết một cuốn sách' })
  @ApiOkResponse({ type: BookDetailResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'workId sai định dạng',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Không có sách này trên Open Library',
  })
  getOne(@Param() params: WorkIdParamDTO) {
    return this.books.getOne(params.workId);
  }
}
