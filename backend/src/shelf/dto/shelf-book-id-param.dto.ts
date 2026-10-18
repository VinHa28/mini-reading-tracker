import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ShelfBookIdParamDTO {
  @ApiProperty({ description: 'Id của sách trong tủ', example: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt({ message: 'shelfBookId phải là số nguyên' })
  @Min(1, { message: 'shelfBookId phải lớn hơn 0' })
  shelfBookId: number;
}
