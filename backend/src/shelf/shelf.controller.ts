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
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiGatewayTimeoutResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ShelfService } from './shelf.service';
import { AddToShelfDTO } from './dto/add-to-shelf.dto';
import { ListShelfDTO } from './dto/list-shelf.dto';
import { ShelfBookIdParamDTO } from './dto/shelf-book-id-param.dto';
import { UpdateShelfDTO } from './dto/update-shelf.dto';
import {
  ShelfBookResponseDto,
  ShelfStatsResponseDto,
} from './dto/shelf-response.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

@ApiTags('shelf')
@Controller('shelf')
export class ShelfController {
  constructor(private readonly shelf: ShelfService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách sách trong tủ (mới cập nhật lên đầu)' })
  @ApiOkResponse({ type: [ShelfBookResponseDto] })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'status không hợp lệ',
  })
  list(@Query() query: ListShelfDTO) {
    return this.shelf.list(query.status);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Thống kê số sách theo trạng thái' })
  @ApiOkResponse({ type: ShelfStatsResponseDto })
  stats() {
    return this.shelf.stats();
  }

  @Get(':shelfBookId')
  @ApiOperation({ summary: 'Một sách trong tủ' })
  @ApiOkResponse({ type: ShelfBookResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Id sai định dạng',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Không tìm thấy sách trong tủ',
  })
  getById(@Param() params: ShelfBookIdParamDTO) {
    return this.shelf.findById(params.shelfBookId);
  }

  @Patch(':shelfBookId')
  @ApiOperation({
    summary: 'Cập nhật tiến độ, trạng thái, đánh giá, ghi chú',
    description:
      'Gửi ít nhất một trong: currentPage, status, rating, note. currentPage bằng totalPages thì tự động FINISHED; FINISHED không đi kèm currentPage nhỏ hơn totalPages.',
  })
  @ApiOkResponse({ type: ShelfBookResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description:
      'Dữ liệu không hợp lệ hoặc vi phạm quy tắc (vượt số trang, body rỗng...)',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Không tìm thấy sách trong tủ',
  })
  updateById(
    @Param() params: ShelfBookIdParamDTO,
    @Body() dto: UpdateShelfDTO,
  ) {
    return this.shelf.update(params.shelfBookId, dto);
  }

  @Delete(':shelfBookId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Xóa sách khỏi tủ' })
  @ApiNoContentResponse({ description: 'Đã xóa' })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Id sai định dạng',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Không tìm thấy sách trong tủ',
  })
  remove(@Param() params: ShelfBookIdParamDTO) {
    return this.shelf.remove(params.shelfBookId);
  }

  @Post()
  @ApiOperation({
    summary: 'Thêm sách vào tủ',
    description: 'Thông tin sách được lấy từ Open Library theo workId.',
  })
  @ApiCreatedResponse({ type: ShelfBookResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'workId hoặc status sai',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Không có sách này trên Open Library',
  })
  @ApiConflictResponse({
    type: ErrorResponseDto,
    description: 'Sách đã có trong tủ',
  })
  @ApiBadGatewayResponse({
    type: ErrorResponseDto,
    description: 'Open Library không phản hồi được',
  })
  @ApiGatewayTimeoutResponse({
    type: ErrorResponseDto,
    description: 'Open Library phản hồi quá chậm',
  })
  add(@Body() dto: AddToShelfDTO) {
    return this.shelf.add(dto);
  }
}
