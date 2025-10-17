import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { GenerationItemType } from "../enums/generation-item-type.enum";

export class GenerationItemOptionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty()
  @IsBoolean()
  is_correct: boolean;
}

export class UpdateGenerationItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  stem: string;

  @ApiProperty({ enum: GenerationItemType })
  @IsEnum(GenerationItemType)
  type: GenerationItemType;

  @ApiPropertyOptional({ type: [GenerationItemOptionDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  options?: GenerationItemOptionDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expected_answer?: string;
}

