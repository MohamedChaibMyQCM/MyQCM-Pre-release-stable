import { IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { ReportCategory } from "../type/enum/report-category.enum";
import { ReportSeverity } from "../type/enum/report-severity.enum";
import { ApiProperty } from "@nestjs/swagger";

export class CreateReportDto {
  @ApiProperty({
    description: "Title of the report",
    maxLength: 100,
    example: "Bug in the login feature",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: "Category of the report",
    enum: ReportCategory,
    example: ReportCategory.OTHER,
  })
  @IsEnum(ReportCategory)
  category: ReportCategory;

  @ApiProperty({
    description: "Detailed description of the report",
    example:
      "The login feature fails when using special characters in the password.",
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: "Severity of the report",
    enum: ReportSeverity,
    example: ReportSeverity.HIGH,
  })
  @IsEnum(ReportSeverity)
  severity: ReportSeverity;
}
