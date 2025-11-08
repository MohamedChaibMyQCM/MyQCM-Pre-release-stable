import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

const MAX_REVIEW_IDS = 50;

export class KnowledgeComponentAiReviewRequestDto {
  @ApiPropertyOptional({
    description: "Limit the review to a subset of MCQs.",
    type: [String],
    maxItems: MAX_REVIEW_IDS,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_REVIEW_IDS)
  @IsUUID("4", { each: true })
  mcqIds?: string[];
}

export class KnowledgeComponentAiApplyItemDto {
  @ApiProperty({
    description: "Identifier of the MCQ to update.",
    type: String,
  })
  @IsUUID("4")
  mcqId: string;

  @ApiProperty({
    description: "Knowledge components that should be linked to the MCQ.",
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID("4", { each: true })
  componentIds: string[];
}

export class KnowledgeComponentAiApplyRequestDto {
  @ApiProperty({
    description: "List of MCQ updates containing their selected knowledge components.",
    type: [KnowledgeComponentAiApplyItemDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => KnowledgeComponentAiApplyItemDto)
  items: KnowledgeComponentAiApplyItemDto[];
}
