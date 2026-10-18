import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchBooksDTO {
  @ApiProperty({
    description: 'Từ khóa tìm kiếm (tên sách, tác giả)',
    example: 'harry potter',
    maxLength: 200,
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'q must be not empty' })
  @MaxLength(200)
  q: string;

  @ApiPropertyOptional({
    description: 'Số trang kết quả (20 sách mỗi trang)',
    minimum: 1,
    maximum: 500,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  page: number = 1;
}
