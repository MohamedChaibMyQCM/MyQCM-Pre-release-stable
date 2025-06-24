import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  IsDate,
  IsUUID,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { TrainingSessionStatus } from "../enums/training-session.enum";

export class CreateTrainingSessionDto {
  @ApiPropertyOptional({
    description: "Title of the training session",
    example: "Medical Exam Practice",
    type: String,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: "Flag to indicate if this is a QCM type training",
    example: true,
    type: Boolean,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  qcm: boolean;

  @ApiProperty({
    description: "Flag to indicate if this is a QCS type training",
    example: true,
    type: Boolean,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  qcs: boolean;

  @ApiProperty({
    description: "Flag to indicate if this is a Qroc type training",
    example: true,
    type: Boolean,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  qroc: boolean;

  @ApiProperty({
    description: "Time limit for the training session in minutes",
    example: 30,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  time_limit: number;

  @ApiPropertyOptional({
    description: "Number of questions in the training session",
    example: 20,
    type: Number,
    default: 20,
  })
  @IsNumber()
  @IsOptional()
  number_of_questions?: number;

  @ApiPropertyOptional({
    description:
      "Flag to indicate if questions should be shown in random order",
    example: true,
    type: Boolean,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  randomize_questions_order?: boolean;

  @ApiPropertyOptional({
    description: "Flag to indicate if options should be shown in random order",
    example: true,
    type: Boolean,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  randomize_options_order?: boolean;

  @ApiPropertyOptional({
    description: "Status of the training session",
    enum: TrainingSessionStatus,
    default: TrainingSessionStatus.SCHEDULED,
  })
  @IsEnum(TrainingSessionStatus)
  @IsOptional()
  @IsOptional()
  status?: TrainingSessionStatus;

  @ApiPropertyOptional({
    description: "Scheduled date of the training session",
    example: "2023-09-15T14:30:00Z",
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  scheduled_at?: Date;

  @ApiPropertyOptional({
    description: "Course ID for the training session",
    example: 1,
    type: Number,
  })
  @IsUUID("4")
  course: string;
}
