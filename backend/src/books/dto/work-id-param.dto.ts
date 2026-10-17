import { Matches } from "class-validator";

export class WorkIdParamDto {
      @Matches(/^OL\d+W$/, { message: 'workId must look like OL123W' })
      workId: string;
}