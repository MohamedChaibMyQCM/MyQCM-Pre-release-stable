import { ApiProperty } from "@nestjs/swagger";
import { IsStrongPassword } from "class-validator";

export class UpdateFreelancerPasswordDto {
  @ApiProperty({ description: "freelancer old password" })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  old_password: string;

  @ApiProperty({ description: "freelancer new password" })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  new_password: string;
}
