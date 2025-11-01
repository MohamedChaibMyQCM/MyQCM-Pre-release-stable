import {
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsString,
  IsOptional,
  MaxLength,
} from "class-validator";

export class CompleteAlphaSessionDto {
  @IsNotEmpty()
  @IsString()
  activity_id: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  feedback_text?: string;
}
