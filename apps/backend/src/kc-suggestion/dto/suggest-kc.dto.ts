import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class SuggestKcOptionDto {
  @IsString()
  @MaxLength(500)
  content: string;

  @IsOptional()
  @IsBoolean()
  is_correct?: boolean;
}

export class SuggestKcMetadataDto {
  @IsOptional()
  @IsString()
  mcqId?: string;

  @IsOptional()
  @IsString()
  source?: string;
}

export class SuggestKcItemDto {
  @IsString()
  @MaxLength(2000)
  stem: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  explanation?: string | null;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SuggestKcOptionDto)
  options: SuggestKcOptionDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(25)
  candidate_component_ids?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(25)
  candidate_component_slugs?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SuggestKcMetadataDto)
  metadata?: SuggestKcMetadataDto;
}

export class SuggestKcRequestDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(5)
  @ValidateNested({ each: true })
  @Type(() => SuggestKcItemDto)
  items: SuggestKcItemDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(25)
  targeted_component_ids?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(25)
  targeted_component_slugs?: string[];
}
