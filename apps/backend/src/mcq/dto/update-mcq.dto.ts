import { ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { CreateMcqDto } from "./create-mcq.dto";
import { IsArray, IsOptional, IsUUID } from "class-validator";

export class UpdateMcqDto extends PartialType(CreateMcqDto) {
  @ApiPropertyOptional({
    description: "Identifiers of options to remove from this MCQ",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  options_to_delete?: string[];
}
