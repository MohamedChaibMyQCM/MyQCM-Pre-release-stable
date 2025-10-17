import { ApiProperty } from "@nestjs/swagger";
import {
  ArrayNotEmpty,
  IsArray,
  IsUUID,
} from "class-validator";

export class ApproveMcqBulkDto {
  @ApiProperty({
    description: "List of MCQ identifiers to approve.",
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID("4", { each: true })
  mcqIds: string[];
}
