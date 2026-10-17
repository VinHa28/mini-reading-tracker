import { IsInt, Max, Min } from 'class-validator';

export class UpdateShelfDTO {
  @IsInt({ message: 'currentPage phải là số nguyên' })
  @Min(0, { message: 'currentPage phải >= 0 ' })
  @Max(2147483647, { message: 'currentPage quá lớn ' })
  currentPage: number;
}
