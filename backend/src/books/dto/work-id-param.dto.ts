import { Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WorkIdParamDTO {
  @ApiProperty({
    description: 'Mã work của Open Library',
    example: 'OL82563W',
    pattern: '^OL\\d+W$',
  })
  @Matches(/^OL\d+W$/, { message: 'workId must look like OL123W' })
  workId: string;
}
