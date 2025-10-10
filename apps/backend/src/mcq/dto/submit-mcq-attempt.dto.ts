import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from "class-validator";

export class SubmitMcqAttemptOptionDto {
  @ApiProperty({
    description: "The option id for the MCQ.",
    example: "f7b3b3b3-1b1b-4b3b-8b3b-1b1b1b1b1b1b",
  })
  @IsUUID("4")
  option: string;
}

export class SubmitMcqAttemptDto {
  @ApiPropertyOptional({
    description: "List of user options as response for the MCQ.",
    type: [SubmitMcqAttemptOptionDto],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SubmitMcqAttemptOptionDto)
  response_options?: SubmitMcqAttemptOptionDto[];

  @ApiPropertyOptional({
    description: "user response for the MCQ.",
    type: String,
  })
  @IsOptional()
  @IsString()
  response?: string;

  @ApiPropertyOptional({
    description:
      "Time spent in seconds since the MCQ appeared until this request was sent.",
    type: Number,
    example: 55,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  time_spent: number;

  @ApiProperty({
    description:
      "The id of the session the user currently attempting this mcq from.",
    example: "f7b3b3b3-1b1b-4b3b-8b3b-1b1b1b1b1b1",
  })
  @IsUUID("4")
  session: string;

  @ApiProperty({
    description: "Indicates whether the MCQ attempt is skipped.",
    example: false,
    type: Boolean,
    required: false,
  })
  @IsOptional()
  is_skipped: boolean;
}
