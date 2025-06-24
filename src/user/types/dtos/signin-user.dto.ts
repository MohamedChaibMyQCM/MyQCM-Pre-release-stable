import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsStrongPassword } from "class-validator";

export class SigninUserDto {
  @ApiProperty({
    description: "Email address of the user",
    example: "john.doe@example.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      "User strong password (8 chars min, 1 lowercase, 1 uppercase, 1 number, 0 symbol)",
    example: "Str0ngP@ssw0rd!",
  })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 0,
    minUppercase: 0,
    minNumbers: 0,
    minSymbols: 0,
  })
  password: string;
}
