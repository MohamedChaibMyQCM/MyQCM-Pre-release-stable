import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import {
  McqApprovalStatus,
  McqDifficulty,
  McqTag,
  McqType,
  QuizType,
} from "./mcq.type";
import { CreateOptionDto } from "src/option/dto/create-option.dto";
import { Type } from "class-transformer";
import { YearOfStudy } from "src/user/types/enums/user-study-year.enum";

export class CreateMcqDto {
  @ApiProperty({
    description: "Year of study",
    enum: YearOfStudy,
    example: YearOfStudy.first_year,
  })
  @IsEnum(YearOfStudy)
  year_of_study: YearOfStudy;

  @ApiProperty({
    description: "Type of the MCQ.",
    enum: McqType,
    default: McqType.qcm,
  })
  @IsEnum(McqType)
  @IsNotEmpty()
  type: McqType;

  @ApiPropertyOptional({
    description: "Estimated time to solve the MCQ in seconds.",
    example: 120,
  })
  @IsNotEmpty()
  @IsNumber()
  estimated_time: number;

  @ApiProperty({
    description: "the tag for this mcq",
    example: McqTag.exam,
  })
  @IsEnum(McqTag)
  mcq_tags: McqTag;

  @ApiProperty({
    description: "Quiz type.",
    example: QuizType.pratique,
  })
  @IsEnum(QuizType)
  quiz_type: QuizType;

  @ApiPropertyOptional({
    description: "Qroc keywords",
    example: '["keyword1"]',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  keywords: string[];

  @ApiProperty({
    description: "The question for the MCQ.",
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiPropertyOptional({
    description: "The answer for the MCQ.",
    type: String,
  })
  @IsOptional()
  @IsString()
  answer?: string;

  @ApiProperty({
    description: "Baseline for the mcq",
    default: 1,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  baseline: number;

  @ApiPropertyOptional({
    description: "List of options for the MCQ.",
    type: [CreateOptionDto],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  options?: CreateOptionDto[];

  @ApiPropertyOptional({
    description: "Explanation for the MCQ.",
  })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiProperty({
    description: "Difficulty level of the MCQ.",
    enum: McqDifficulty,
    default: McqDifficulty.medium,
  })
  @IsEnum(McqDifficulty)
  @IsNotEmpty()
  difficulty: McqDifficulty;

  @ApiProperty({
    description: "Promo when the MCQ was created or applicable.",
    example: 2024,
  })
  @IsNumber()
  @Min(2015)
  @Max(2025)
  @IsNotEmpty()
  promo: number;

  @ApiProperty({
    description: "UUID of the university to associate with the MCQ.",
    type: String,
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID("4")
  @IsNotEmpty()
  university: string;

  @ApiProperty({
    description: "UUID of the faculty to associate with the MCQ.",
    type: String,
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID("4")
  @IsNotEmpty()
  faculty: string;

  @ApiProperty({
    description: "UUID of the unit to associate with the MCQ.",
    type: String,
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID("4")
  @IsNotEmpty()
  unit: string;

  @ApiProperty({
    description: "UUID of the subject to associate with the MCQ.",
    type: String,
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID("4")
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    description: "UUID of the course to associate with the MCQ.",
    type: String,
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID("4")
  @IsNotEmpty()
  course: string;

  @ApiPropertyOptional({
    description: "Approval status of the MCQ.",
    enum: McqApprovalStatus,
    default: McqApprovalStatus.APPROVED,
  })
  @IsOptional()
  @IsEnum(McqApprovalStatus)
  approval_status?: McqApprovalStatus;
}
export class CreateMcqInClinicalCase {
  @IsOptional()
  @Min(2015)
  @Max(2025)
  promo: number;

  @IsOptional()
  @IsEnum(McqType)
  @IsNotEmpty()
  type: McqType;

  @ApiProperty({
    description: "the tag for this mcq",
    example: McqTag.exam,
  })
  @IsEnum(McqTag)
  mcq_tags: McqTag;

  @ApiProperty({
    description: "Quiz type.",
    example: QuizType.pratique,
  })
  @IsEnum(QuizType)
  quiz_type: QuizType;

  @ApiPropertyOptional({
    description: "Qroc keywords",
    example: '["keyword1"]',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  keywords: string[];

  @ApiProperty({
    description: "The question for the MCQ.",
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiPropertyOptional({
    description: "The answer for the MCQ.",
    type: String,
  })
  @IsOptional()
  @IsString()
  answer?: string;

  @ApiPropertyOptional({
    description: "List of options for the MCQ.",
    type: [CreateOptionDto],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  options?: CreateOptionDto[];

  @ApiPropertyOptional({
    description: "Explanation for the MCQ.",
  })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiProperty({
    description: "Difficulty level of the MCQ.",
    enum: McqDifficulty,
    default: McqDifficulty.medium,
  })
  @IsEnum(McqDifficulty)
  @IsNotEmpty()
  difficulty: McqDifficulty;

  @ApiProperty({
    description: "UUID of the course to associate with the MCQ.",
    type: String,
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID("4")
  @IsNotEmpty()
  course: string;
}
