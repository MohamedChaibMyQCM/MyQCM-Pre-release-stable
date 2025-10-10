import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { ModeDefiner } from "../enums/mode-definier.enum";

export class CreateModeDto {
  @ApiProperty({
    description: "The name of the mode",
    maxLength: 100,
    example: "Exam Mode",
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: "Defines how QCM (Multiple Choice Questions) are included",
    enum: ModeDefiner,
    example: ModeDefiner.USER,
  })
  @IsEnum(ModeDefiner)
  include_qcm_definer?: ModeDefiner;

  @ApiProperty({
    description: "Defines how QCS (Single Choice Questions) are included",
    enum: ModeDefiner,
    example: ModeDefiner.USER,
  })
  @IsEnum(ModeDefiner)
  include_qcs_definer?: ModeDefiner;

  @ApiProperty({
    description: "Defines how QROC (Open Response Questions) are included",
    enum: ModeDefiner,
    example: ModeDefiner.USER,
  })
  @IsEnum(ModeDefiner)
  include_qroc_definer?: ModeDefiner;

  @ApiProperty({
    description: "Defines if time limit is enforced",
    enum: ModeDefiner,
    example: ModeDefiner.USER,
  })
  @IsEnum(ModeDefiner)
  time_limit_definer?: ModeDefiner;

  @ApiProperty({
    description: "Defines if number of questions is limited",
    enum: ModeDefiner,
    example: ModeDefiner.USER,
  })
  @IsEnum(ModeDefiner)
  number_of_questions_definer?: ModeDefiner;

  @ApiProperty({
    description: "Defines if questions should be randomized",
    enum: ModeDefiner,
    example: ModeDefiner.USER,
  })
  @IsEnum(ModeDefiner)
  randomize_questions_order_definer?: ModeDefiner;

  @ApiProperty({
    description: "Defines if options should be randomized",
    enum: ModeDefiner,
    example: ModeDefiner.USER,
  })
  @IsEnum(ModeDefiner)
  randomize_options_order_definer?: ModeDefiner;

  @ApiProperty({
    description: "Defines the difficulty of the questions",
    example: false,
    required: false,
  })
  @IsEnum(ModeDefiner)
  difficulty_definer?: ModeDefiner;
}
