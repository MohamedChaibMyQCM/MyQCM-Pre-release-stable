import { Optional } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { YearOfStudy } from "src/user/types/enums/user-study-year.enum";

export class CreateUnitDto {
  @ApiProperty({ description: "name of the unit" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: "description of this unit" })
  @Optional()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: "yaer of study for this unit" })
  @IsEnum(YearOfStudy)
  year_of_study: YearOfStudy;
}
