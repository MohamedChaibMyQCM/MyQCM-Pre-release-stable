import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateRewardPerkDto {
  @IsString()
  @MaxLength(160)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @IsPositive()
  xpCost: number;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  maxRedemptions?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  stock?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  creditMcqs?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  creditQrocs?: number;
}
