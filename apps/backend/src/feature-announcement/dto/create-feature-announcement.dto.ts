import {
  IsString,
  IsEnum,
  IsBoolean,
  IsArray,
  IsOptional,
  IsInt,
  IsDateString,
  MaxLength,
  IsUrl,
} from "class-validator";
import {
  FeatureAnnouncementType,
  FeatureAnnouncementStatus,
  MediaType,
  HighlightStep,
} from "../entities/feature-announcement.entity";

export class CreateFeatureAnnouncementDto {
  @IsString()
  @MaxLength(20)
  version: string;

  @IsDateString()
  release_date: string;

  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  description: string;

  @IsEnum(FeatureAnnouncementType)
  @IsOptional()
  type?: FeatureAnnouncementType;

  @IsEnum(FeatureAnnouncementStatus)
  @IsOptional()
  status?: FeatureAnnouncementStatus;

  @IsEnum(MediaType)
  @IsOptional()
  media_type?: MediaType;

  @IsString()
  @IsOptional()
  media_url?: string;

  @IsString()
  @IsOptional()
  thumbnail_url?: string;

  @IsArray()
  @IsOptional()
  highlight_steps?: HighlightStep[];

  @IsArray()
  @IsOptional()
  target_roles?: string[];

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  cta_text?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  cta_link?: string;

  @IsInt()
  @IsOptional()
  priority?: number;
}
