import { Matches } from "class-validator";

export class WorkIdParamDTO {
      @Matches(/^OL\d+W$/, { message: 'workId must look like OL123W' })
      workId: string;
}