import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
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
import { YearOfStudy } from "src/user/types/enums/user-study-year.enum";
import { CreateMcqInClinicalCase } from "src/mcq/dto/create-mcq.dto";
import { McqDifficulty, McqType } from "src/mcq/dto/mcq.type";
import { FacultyType } from "src/faculty/types/enums/faculty-type.enum";

export class CreateClinicalCaseDto {
  @ApiProperty({
    description: "Year of study",
    enum: YearOfStudy,
    example: YearOfStudy.first_year,
  })
  @IsEnum(YearOfStudy)
  year_of_study: YearOfStudy;

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
    description: "Faculty type of the MCQ.",
    example: FacultyType.general_medicine,
  })
  @IsEnum(FacultyType)
  @IsNotEmpty()
  faculty_type: FacultyType;

  @ApiProperty({
    description: "Title of this clincal case",
    type: String,
    example: "Clinical Case 1",
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: "Author or Contributer of this clincal case name",
    type: String,
    example: "Dr. John Doe",
  })
  @IsString() // date string or date only ?
  @IsNotEmpty()
  author: string;

  @ApiProperty({
    description: "Description of this clincal case",
    type: String,
    example: "This is a description of a clinical case",
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: "Scenario of this clincal case",
    type: String,
    example: "This is a scenario of a clinical case",
  })
  @IsString()
  @IsNotEmpty()
  scenario: string;

  @ApiProperty({
    description: "Pedagogical objectives associated with this clinical case",
    type: [String],
    example: [
      "Identifier les signes cliniques d\'un syndrome coronarien aigu inferieur.",
      "Comprendre la strategie diagnostique initiale aux urgences.",
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  objectives: string[];

  @ApiProperty({
    description: "Tags that categorise the clinical case",
    type: [String],
    example: ["Equipe pedagogique", "General"],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags: string[] = [];

  @ApiProperty({
    description: "Type of the MCQ.",
    enum: McqType,
    default: McqType.qcm,
  })
  @IsEnum(McqType)
  @IsNotEmpty()
  type: McqType;

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
    description: "Array of MCQs associated with this clinical case.",
    type: [CreateMcqInClinicalCase],
    example: [
      {
        question: "What is the capital of France?",
        diffeculty: McqDifficulty.easy,
        unit: "123e4567-e89b-12d3-a456-426614174000",
        subject: "123e4567-e89b-12d3-a456-426614174000",
        course: "123e4567-e89b-12d3-a456-426614174000",
        options: [
          {
            option: "Paris",
            is_correct: true,
          },
          {
            option: "London",
            is_correct: false,
          },
          {
            option: "Berlin",
            is_correct: false,
          },
          {
            option: "Madrid",
            is_correct: false,
          },
        ],
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateMcqInClinicalCase)
  mcqs: CreateMcqInClinicalCase[];
}
