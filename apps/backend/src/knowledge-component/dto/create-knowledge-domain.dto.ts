import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";

export class CreateKnowledgeDomainDto {
  @ApiProperty({ description: "Unique slug for the domain" })
  @IsString()
  @MaxLength(160)
  slug: string;

  @ApiProperty({ description: "Display name for the domain" })
  @IsString()
  @MaxLength(160)
  name: string;

  @ApiProperty({
    required: false,
    description: "Optional description to help authors pick the right domain",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
