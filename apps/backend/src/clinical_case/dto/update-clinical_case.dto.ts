import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";
import { FacultyType } from "src/faculty/types/enums/faculty-type.enum";
import { YearOfStudy } from "src/user/types/enums/user-study-year.enum";
import { McqType } from "src/mcq/dto/mcq.type";

export class UpdateClinicalCaseDto {
  @ApiProperty({
    description: "Promo when the MCQ was created or applicable.",
    example: 2024,
  })
  @IsOptional()
  @IsNumber()
  @Min(2015)
  @Max(2025)
  @IsNotEmpty()
  promo: number;

  @ApiProperty({
    description: "Title of this clincal case",
    type: String,
    example: "Clinical Case 1",
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: "Date of this clincal case",
    type: String,
    example: "01-09-2026",
  })
  @IsOptional()
  @IsDateString() // date string or date only ?
  @IsNotEmpty()
  date: Date;

  @ApiProperty({
    description: "Author or Contributer of this clincal case name",
    type: String,
    example: "Dr. John Doe",
  })
  @IsOptional()
  @IsString() // date string or date only ?
  @IsNotEmpty()
  author: string;

  @ApiProperty({
    description: "Description of this clincal case",
    type: String,
    example: "This is a description of a clinical case",
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: "Scenario of this clincal case",
    type: String,
    example: "This is a scenario of a clinical case",
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  scenario: string;

  @ApiPropertyOptional({
    description: "Faculty type associated with the case",
    enum: FacultyType,
  })
  @IsOptional()
  @IsEnum(FacultyType)
  faculty_type?: FacultyType;

  @ApiPropertyOptional({
    description: "Year of study associated with the case",
    enum: YearOfStudy,
  })
  @IsOptional()
  @IsEnum(YearOfStudy)
  year_of_study?: YearOfStudy;

  @ApiProperty({
    description: "Updated pedagogical objectives",
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  objectives?: string[];

  @ApiProperty({
    description: "Updated tags",
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: "University id to associate with the case",
    type: String,
  })
  @IsOptional()
  @IsUUID("4")
  university?: string;

  @ApiPropertyOptional({
    description: "Faculty id to associate with the case",
    type: String,
  })
  @IsOptional()
  @IsUUID("4")
  faculty?: string;

  @ApiPropertyOptional({
    description: "Unit id to associate with the case",
    type: String,
  })
  @IsOptional()
  @IsUUID("4")
  unit?: string;

  @ApiPropertyOptional({
    description: "Subject id to associate with the case",
    type: String,
  })
  @IsOptional()
  @IsUUID("4")
  subject?: string;

  @ApiPropertyOptional({
    description: "Course id shared across MCQs",
    type: String,
  })
  @IsOptional()
  @IsUUID("4")
  course?: string;

  @ApiPropertyOptional({
    description: "Clinical case MCQ type (applied when adding new MCQs)",
    enum: McqType,
  })
  @IsOptional()
  @IsEnum(McqType)
  type?: McqType;
}
