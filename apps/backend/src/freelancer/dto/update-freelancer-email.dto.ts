import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsStrongPassword } from "class-validator";

export class UpdateFreelancerEmailDto {
  @ApiProperty({ description: "freelancer new email" })
  @IsEmail()
  new_email: string;

  @ApiProperty({ description: "freelancer password " })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;
}
