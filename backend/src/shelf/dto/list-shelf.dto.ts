import { IsEnum, IsOptional } from 'class-validator';
import { ReadingStatus } from '../shelf-book.entity';

export class ListShelfDTO {
  @IsOptional()
  @IsEnum(ReadingStatus)
  status?: ReadingStatus;
}
