import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  IsUrl,
} from "class-validator";

export class SignupUserDto {
  @ApiProperty({
    description: "Full name of the user",
    example: "John Doe",
  })
  @IsNotEmpty()
  @IsString()
  name: string;

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

  @ApiProperty({
    description: "URL of the user's avatar",
    example: "https://example.com/avatar.jpg",
  })
  @IsUrl()
  avatar: string;
}
