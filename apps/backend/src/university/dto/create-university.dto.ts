import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsBooleanString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateUniversityDto {
  @ApiProperty({ description: "name of the university" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: "description of the university" })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: "location of the university (willaya) " })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  location: string; // this need to be talked about

  @ApiProperty({
    description: "does this unniversity have acces to the platform ?",
  })
  @IsOptional()
  @IsNotEmpty()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  has_access: boolean;
}
