import { ApiOperation, ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional } from "class-validator";
export class TrainingSettingDto {
  @ApiProperty({ description: "activate|deactivate qcm training" })
  @IsBoolean()
  qcm: boolean;

  @ApiProperty({ description: "activate|deactivate qcs training" })
  @IsBoolean()
  qcs: boolean;

  @ApiProperty({ description: "activate|deactivate qroc training" })
  @IsOptional()
  @IsBoolean()
  qroc: boolean;

  @ApiProperty({ description: "time limit in minuts" })
  @IsOptional()
  @IsNumber()
  time_limit: number;

  @ApiProperty({ description: "number of questions" })
  @IsOptional()
  @IsNumber()
  number_of_questions: number;

  @ApiProperty({ description: "randomize questions ?" })
  @IsOptional()
  @IsBoolean()
  randomize_questions: boolean;
}
