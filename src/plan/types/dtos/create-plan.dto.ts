import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsNumber,
  IsString,
  IsEnum,
  Min,
  ValidateIf,
} from "class-validator";
import { PlanPeriod } from "./plan.type";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePlanDto {
  @ApiProperty({
    description: "The name of the plan",
    example: "Premium Plan",
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: "The price of the plan",
    example: 99.99,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @Min(0)
  @IsNumber()
  price?: number;

  @ApiProperty({
    description: "Number of MCQs available in the plan",
    example: 500,
    required: true,
    nullable: true,
    minimum: 0,
  })
  @IsNotEmpty()
  @ValidateIf((o) => o.mcqs !== null)
  @IsNumber()
  @Min(0)
  mcqs: number | null;

  @ApiProperty({
    description: "Whether explanations are included in the plan",
    example: true,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  explanations: boolean;

  @ApiProperty({
    description: "Number of QROCs available in the plan",
    example: 200,
    required: true,
    nullable: true,
    minimum: 0,
  })
  @IsNotEmpty()
  @ValidateIf((o) => o.qrocs !== null)
  @IsNumber()
  @Min(0)
  qrocs: number | null;

  @ApiProperty({
    description: "Whether notifications are included in the plan",
    example: true,
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  notifications: boolean;

  @ApiProperty({
    description: "Whether analysis features are included in the plan",
    example: true,
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  analysis: boolean;

  @ApiProperty({
    description: "Number of devices allowed for this plan",
    example: 3,
    required: true,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  devices: number;

  @ApiProperty({
    description: "Whether this is the default plan",
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_default: boolean = false;

  @ApiProperty({
    description: "The billing period for the plan",
    enum: PlanPeriod,
    example: "MONTHLY",
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(PlanPeriod)
  period: PlanPeriod;

  @ApiProperty({
    description: "XP reward for purchasing this plan",
    example: 500,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  xp_reward: number = 0;
}
