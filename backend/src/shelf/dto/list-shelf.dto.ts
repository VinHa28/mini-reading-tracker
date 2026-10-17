import { IsEnum, IsOptional } from 'class-validator';
import { ReadingStatus } from '../shelf-book.entity';

export class ListShelfDto {
  @IsOptional()
  @IsEnum(ReadingStatus)
  status?: ReadingStatus;
}
