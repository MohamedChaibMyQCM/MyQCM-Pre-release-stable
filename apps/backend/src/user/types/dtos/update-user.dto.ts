import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
  @ApiProperty({
    description: "Avatar URL",
    type: String,
    required: false,
    example: "https://example.com/avatar.png",
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: "Has the user completed the introduction?",
    type: Boolean,
    required: false,
    example: true,
    default: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  completed_introduction: boolean;
}
