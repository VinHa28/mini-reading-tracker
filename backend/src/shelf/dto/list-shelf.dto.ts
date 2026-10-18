import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReadingStatus } from '../shelf-book.entity';

export class ListShelfDTO {
  @ApiPropertyOptional({
    enum: ReadingStatus,
    enumName: 'ReadingStatus',
    description: 'Lọc theo trạng thái; bỏ trống để lấy tất cả',
  })
  @IsOptional()
  @IsEnum(ReadingStatus)
  status?: ReadingStatus;
}
