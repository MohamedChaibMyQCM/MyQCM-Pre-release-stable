import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from "class-validator";

export class CreateKnowledgeComponentDto {
  @ApiProperty({ description: "Slug used to uniquely identify the KC" })
  @IsString()
  @MaxLength(190)
  slug: string;

  @ApiProperty({ description: "Display name for the KC" })
  @IsString()
  @MaxLength(190)
  name: string;

  @ApiProperty({
    required: false,
    description: "Short code or abbreviation for the KC",
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  code?: string;

  @ApiProperty({
    required: false,
    description: "Optional description to aid authors",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Identifier of the domain this KC belongs to",
  })
  @IsUUID("4")
  domain_id: string;

  @ApiProperty({
    required: false,
    description: "Optional identifier of the course this KC belongs to",
  })
  @IsOptional()
  @IsUUID("4")
  course_id?: string;

  @ApiProperty({
    required: false,
    description: "Optional identifier of the parent KC for hierarchical taxonomies",
  })
  @IsOptional()
  @IsUUID("4")
  parent_id?: string;

  @ApiProperty({
    required: false,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  level?: number;

  @ApiProperty({
    required: false,
    description: "Whether the KC is currently available for tagging",
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    required: false,
    description: "Optional list of child KC definitions for seeding convenience",
    type: () => [CreateKnowledgeComponentDto],
  })
  @IsOptional()
  @IsArray()
  children?: CreateKnowledgeComponentDto[];
}
