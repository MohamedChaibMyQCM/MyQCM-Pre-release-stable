import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsUUID } from "class-validator";
import { YearOfStudy } from "src/user/types/enums/user-study-year.enum";

export class McqBatchUploadMetadataDto {
  @ApiProperty({
    description: "Year of study associated with the uploaded questions.",
    enum: YearOfStudy,
  })
  @IsEnum(YearOfStudy)
  year_of_study: YearOfStudy;

  @ApiProperty({
    description: "University id that the questions will be attached to.",
  })
  @IsUUID("4")
  @IsNotEmpty()
  university: string;

  @ApiProperty({
    description: "Faculty id that the questions will be attached to.",
  })
  @IsUUID("4")
  @IsNotEmpty()
  faculty: string;

  @ApiProperty({
    description: "Unit id that the questions will be attached to.",
  })
  @IsUUID("4")
  @IsNotEmpty()
  unit: string;

  @ApiProperty({
    description: "Subject id that the questions will be attached to.",
  })
  @IsUUID("4")
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    description: "Course id that the questions will be attached to.",
  })
  @IsUUID("4")
  @IsNotEmpty()
  course: string;
}
