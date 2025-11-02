import { ApiProperty } from "@nestjs/swagger";
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { YearOfStudy } from "src/user/types/enums/user-study-year.enum";
import { McqDifficulty } from "src/mcq/dto/mcq.type";
import { GenerationItemType } from "../enums/generation-item-type.enum";
import { Type } from "class-transformer";

export class RequestedCountsDto {
  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(0)
  @Max(100)
  mcq: number;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(0)
  @Max(100)
  qroc: number;
}

export class CreateGenerationRequestDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  @IsNotEmpty()
  university: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  @IsNotEmpty()
  faculty: string;

  @ApiProperty({ enum: YearOfStudy })
  @IsEnum(YearOfStudy)
  year_of_study: YearOfStudy;

  @ApiProperty({ format: "uuid", required: false })
  @IsUUID("4")
  @IsOptional()
  unit?: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID("4")
  @IsNotEmpty()
  course: string;

  @ApiProperty({ enum: McqDifficulty })
  @IsEnum(McqDifficulty)
  difficulty: McqDifficulty;

  @ApiProperty({ type: RequestedCountsDto })
  @ValidateNested()
  @Type(() => RequestedCountsDto)
  requestedCounts: RequestedCountsDto;

  @ApiProperty({
    type: [String],
    enum: GenerationItemType,
    isArray: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(GenerationItemType, { each: true })
  contentTypes: GenerationItemType[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sourceFileName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sourceFileMime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  sourceFileSize?: number;

  @ApiProperty({
    type: [String],
    description: "Target knowledge component identifiers",
    example: ["550e8400-e29b-41d4-a716-446655440000"],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID("4", { each: true })
  knowledge_component_ids: string[];
}
