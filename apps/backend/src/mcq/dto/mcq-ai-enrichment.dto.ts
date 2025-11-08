import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from "class-validator";

export class McqAiEnrichmentRequestDto {
  @ApiPropertyOptional({
    description:
      "Specific MCQ identifiers to enqueue for enrichment. If omitted, the backend selects pending MCQs automatically.",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  mcq_ids?: string[];

  @ApiPropertyOptional({
    description:
      "Limit of MCQs to select when mcq_ids is not provided. Defaults to 25 and capped by service configuration.",
    minimum: 1,
    maximum: 200,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @ApiPropertyOptional({
    description:
      "If true, only MCQs without previous AI suggestions are included. Disable to reprocess existing suggestions.",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  only_pending?: boolean;
}
