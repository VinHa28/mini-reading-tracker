import { IsEnum, IsOptional, Matches } from "class-validator";
import { ReadingStatus } from "../shelf-book.entity";

export class AddToShelfDTO {
    @Matches(/^OL\d+W$/, { message: 'workId must look like OL123W' })
    workId: string;

    @IsOptional()
    @IsEnum(ReadingStatus)
    status: ReadingStatus = ReadingStatus.WANT_TO_READ;
}