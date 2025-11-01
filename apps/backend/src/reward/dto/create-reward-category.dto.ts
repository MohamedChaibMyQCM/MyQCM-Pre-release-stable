import { IsBoolean, IsInt, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateRewardCategoryDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsString()
  @MaxLength(150)
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
