import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { FacultyType } from "../enums/faculty-type.enum";

export class CreateFacultyDto {
  @ApiProperty({ description: "faculty name", example: "Faculty of Medicine" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "faculty type",
    required: true,
    example: "General Medicine",
  })
  @IsEnum(FacultyType)
  type: FacultyType;

  @ApiProperty({
    description: "faculty description",
    required: false,
    example: "This is a faculty description",
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: "University id that this faculty relates to",
    required: true,
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID("4")
  university: string;
}
