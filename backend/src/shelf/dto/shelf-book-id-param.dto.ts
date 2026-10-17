import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ShelfBookIdParamDTO {
  @Type(() => Number)
  @IsInt({ message: 'shelfBookId phải là số nguyên' })
  @Min(1, { message: 'shelfBookId phải lớn hơn 0' })
  shelfBookId: number;
}
