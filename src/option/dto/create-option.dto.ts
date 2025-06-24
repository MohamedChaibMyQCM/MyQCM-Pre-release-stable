import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class CreateOptionDto {
  @IsOptional()
  id: string; // for update mcq option

  @ApiProperty({
    description: "The option content for the MCQ.",
    example: "Option content",
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: "Whether the option is correct or not.",
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  is_correct: boolean;
}

export class CreateProgressOptionDto {
  @ApiProperty({
    description: "The option id for the MCQ.",
    example: "f7b3b3b3-1b1b-4b3b-8b3b-1b1b1b1b1b1b",
  })
  @IsUUID("4")
  option: string;
}
