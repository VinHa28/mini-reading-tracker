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
import { ReadingStatus } from '../shelf-book.entity';

export class UpdateShelfDTO {
  @IsOptional()
  @IsInt({ message: 'currentPage phải là số nguyên' })
  @Min(0, { message: 'currentPage phải >= 0 ' })
  @Max(2147483647, { message: 'currentPage quá lớn ' })
  currentPage?: number;

  @IsOptional()
  @IsEnum(ReadingStatus, {
    message: `status phải là một trong: ${Object.values(ReadingStatus).join(', ')}`,
  })
  status?: ReadingStatus;

  // null được @IsOptional bỏ qua, nghĩa là "xóa đánh giá".
  @IsOptional()
  @IsInt({ message: 'rating phải là số nguyên từ 1 đến 5' })
  @Min(1, { message: 'rating phải từ 1 đến 5' })
  @Max(5, { message: 'rating phải từ 1 đến 5' })
  rating?: number | null;

  // Trim trước khi kiểm tra độ dài; null hoặc chuỗi rỗng nghĩa là "xóa ghi chú".
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'note phải là chuỗi' })
  @MaxLength(500, { message: 'note tối đa 500 ký tự' })
  note?: string | null;
}
