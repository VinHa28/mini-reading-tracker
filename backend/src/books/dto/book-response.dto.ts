import { ApiProperty } from '@nestjs/swagger';

export class BookSummaryResponseDto {
  @ApiProperty({ example: 'OL82563W' })
  workId: string;

  @ApiProperty({ example: "Harry Potter and the Philosopher's Stone" })
  title: string;

  @ApiProperty({ type: [String], example: ['J. K. Rowling'] })
  authors: string[];

  @ApiProperty({ type: Number, nullable: true, example: 15155833 })
  coverId: number | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'https://covers.openlibrary.org/b/id/15155833-M.jpg',
  })
  coverUrl: string | null;

  @ApiProperty({ type: Number, nullable: true, example: 1997 })
  firstPublishYear: number | null;

  @ApiProperty({ type: Number, nullable: true, example: 302 })
  totalPages: number | null;

  @ApiProperty({ description: 'Sách đã có trong tủ chưa' })
  inShelf: boolean;

  @ApiProperty({
    type: Number,
    nullable: true,
    description: 'Id trong tủ (null nếu chưa thêm)',
  })
  shelfBookId: number | null;
}

export class BookSearchResponseDto {
  @ApiProperty({ type: [BookSummaryResponseDto] })
  items: BookSummaryResponseDto[];

  @ApiProperty({
    description: 'Tổng số kết quả trên Open Library',
    example: 4068,
  })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  pageSize: number;
}

export class BookDetailResponseDto extends BookSummaryResponseDto {
  @ApiProperty({ type: String, nullable: true })
  description: string | null;

  @ApiProperty({ type: [String] })
  subjects: string[];
}
