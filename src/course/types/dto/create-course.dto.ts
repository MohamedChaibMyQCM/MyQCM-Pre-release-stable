import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class CreateCourseDto {
  @ApiProperty({ description: "Name of the course" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: "Description of the course", required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: "Subject of the course" })
  @IsUUID("4")
  subject: string;

  @ApiProperty({
    description: "Learning rate for the course",
    default: 0.3,
    type: Number,
  })
  @IsNumber()
  learning_rate: number;

  @ApiProperty({
    description: "Probability of guessing correctly",
    default: 0.2,
    type: Number,
  })
  @IsNumber()
  guessing_probability: number;

  @ApiProperty({
    description: "Probability of slipping or making a mistake",
    default: 0.1,
    type: Number,
  })
  @IsNumber()
  slipping_probability: number;

  @ApiProperty({
    description: "Attachment file path or URL",
    required: false,
  })
  @IsOptional()
  @IsString()
  attachment?: string;
}
