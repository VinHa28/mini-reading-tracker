import { ApiProperty } from '@nestjs/swagger';
import { ReadingStatus } from '../shelf-book.entity';

export class ShelfBookResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'OL82563W' })
  workId: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ description: 'Các tác giả, nối bằng dấu phẩy' })
  authors: string;

  @ApiProperty({ type: Number, nullable: true })
  coverId: number | null;

  @ApiProperty({ type: Number, nullable: true })
  firstPublishYear: number | null;

  @ApiProperty({ type: Number, nullable: true })
  totalPages: number | null;

  @ApiProperty({ enum: ReadingStatus, enumName: 'ReadingStatus' })
  status: ReadingStatus;

  @ApiProperty({ example: 0 })
  currentPage: number;

  @ApiProperty({ type: Number, nullable: true, minimum: 1, maximum: 5 })
  rating: number | null;

  @ApiProperty({ type: String, nullable: true, maxLength: 500 })
  note: string | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  startedAt: Date | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  finishedAt: Date | null;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}

export class ShelfStatsResponseDto {
  @ApiProperty({ example: 3 })
  WANT_TO_READ: number;

  @ApiProperty({ example: 2 })
  READING: number;

  @ApiProperty({ example: 5 })
  FINISHED: number;

  @ApiProperty({ example: 10 })
  total: number;
}
