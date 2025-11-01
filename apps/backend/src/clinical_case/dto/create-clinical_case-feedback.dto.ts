import { ApiProperty } from "@nestjs/swagger";
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export class CreateClinicalCaseFeedbackDto {
  @ApiProperty({
    description:
      "Identifier of the clinical case being evaluated. Use 'demo' for the demo case.",
    example: "demo",
  })
  @IsString()
  @MaxLength(255)
  case_identifier: string;

  @ApiProperty({
    description: "Rating provided by the user on a 1-5 scale",
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: "Optional qualitative feedback provided by the user",
    example: "Super cas, le scénario est très réaliste.",
    required: false,
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  review?: string;
}
