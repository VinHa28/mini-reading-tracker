import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ReadingStatus } from '../shelf-book.entity';

/** Gửi ít nhất một trong 4 trường. Trường không gửi thì giữ nguyên. */
export class UpdateShelfDTO {
  @ApiPropertyOptional({
    description:
      'Số trang đã đọc (0 đến totalPages). Đủ trang thì tự động FINISHED.',
    minimum: 0,
    example: 120,
  })
  @IsOptional()
  @IsInt({ message: 'currentPage phải là số nguyên' })
  @Min(0, { message: 'currentPage phải >= 0 ' })
  @Max(2147483647, { message: 'currentPage quá lớn ' })
  currentPage?: number;

  @ApiPropertyOptional({ enum: ReadingStatus, enumName: 'ReadingStatus' })
  @IsOptional()
  @IsEnum(ReadingStatus, {
    message: `status phải là một trong: ${Object.values(ReadingStatus).join(', ')}`,
  })
  status?: ReadingStatus;

  // null được @IsOptional bỏ qua, nghĩa là "xóa đánh giá".
  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    minimum: 1,
    maximum: 5,
    description: 'Số sao từ 1 đến 5; gửi null để xóa đánh giá',
  })
  @IsOptional()
  @IsInt({ message: 'rating phải là số nguyên từ 1 đến 5' })
  @Min(1, { message: 'rating phải từ 1 đến 5' })
  @Max(5, { message: 'rating phải từ 1 đến 5' })
  rating?: number | null;

  // Trim trước khi kiểm tra độ dài; null hoặc chuỗi rỗng nghĩa là "xóa ghi chú".
  @ApiPropertyOptional({
    type: String,
    nullable: true,
    maxLength: 500,
    description:
      'Ghi chú ngắn (tối đa 500 ký tự, tự cắt khoảng trắng hai đầu); null hoặc rỗng để xóa',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'note phải là chuỗi' })
  @MaxLength(500, { message: 'note tối đa 500 ký tự' })
  note?: string | null;
}
