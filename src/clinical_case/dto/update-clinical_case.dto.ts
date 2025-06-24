import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

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
}
