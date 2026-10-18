import { IsEnum, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReadingStatus } from '../shelf-book.entity';

export class AddToShelfDTO {
  @ApiProperty({
    description: 'Mã work của Open Library',
    example: 'OL82563W',
    pattern: '^OL\\d+W$',
  })
  @Matches(/^OL\d+W$/, { message: 'workId must look like OL123W' })
  workId: string;

  @ApiPropertyOptional({
    enum: ReadingStatus,
    enumName: 'ReadingStatus',
    default: ReadingStatus.WANT_TO_READ,
  })
  @IsOptional()
  @IsEnum(ReadingStatus)
  status: ReadingStatus = ReadingStatus.WANT_TO_READ;
}
