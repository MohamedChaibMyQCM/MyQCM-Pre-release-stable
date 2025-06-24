import { Optional } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { YearOfStudy } from "src/user/types/enums/user-study-year.enum";
import { SubjectSemestre } from "./subject.type";
export class CreateSubjectDto {
  @ApiProperty({ description: "name of the subject" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: "description of this subject" })
  @Optional()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: "Semestre of this subject if this subject is for first year",
  })
  @IsOptional()
  @IsEnum(SubjectSemestre)
  subject_semestre: SubjectSemestre;

  @ApiProperty({ description: "yaer of study for this unit" })
  @IsEnum(YearOfStudy)
  year_of_study: YearOfStudy;

  @ApiProperty({
    description:
      "the unit id of this subject (module) if the subject is not for first year",
  })
  @IsOptional()
  @IsUUID("4")
  unit: string;
}
