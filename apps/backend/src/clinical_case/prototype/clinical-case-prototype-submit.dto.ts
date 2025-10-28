import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

class PrototypeClinicalCaseSubmitOptionDto {
  @ApiProperty({ description: "Identifier of the option", type: String })
  @IsString()
  option: string;
}

export class PrototypeClinicalCaseSubmitDto {
  @ApiProperty({ description: "Identifier of the MCQ being answered" })
  @IsString()
  mcq: string;

  @ApiProperty({
    description: "Selected options for QCM/QCS questions",
    type: [PrototypeClinicalCaseSubmitOptionDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrototypeClinicalCaseSubmitOptionDto)
  response_options?: PrototypeClinicalCaseSubmitOptionDto[];

  @ApiProperty({
    description: "Free text response for QROC questions",
    required: false,
  })
  @IsOptional()
  @IsString()
  response?: string | null;

  @ApiProperty({
    description: "Flag to mark question as skipped",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_skipped?: boolean;
}
