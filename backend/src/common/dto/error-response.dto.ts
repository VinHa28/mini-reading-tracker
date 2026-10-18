import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Định dạng lỗi chung, do AllExceptionsFilter trả về cho mọi lỗi. */
export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Bad Request' })
  error: string;

  @ApiProperty({ example: 'Dữ liệu không hợp lệ' })
  message: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Chi tiết từng trường sai (chỉ có khi lỗi validate)',
    example: ['rating phải từ 1 đến 5'],
  })
  details?: string[];

  @ApiProperty({ example: '/api/shelf/1' })
  path: string;

  @ApiProperty({ example: '2026-10-18T01:34:56.591Z' })
  timestamp: string;
}
