import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
  MinLength,
} from "class-validator";
import exp from "constants";

export class SigninFreelancerDto {
  @ApiProperty({ description: "freelancer email" })
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      "freelancer strong password (8 chars min , 1 lower case , 1 upper case , 1 number , 1 symbole ",
  })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;
}

export class SigninFreelancerByCodeDto {
  @ApiProperty({ description: "freelancer code to signin with" })
  @IsString()
  @IsNotEmpty()
  //@Length(8, 8, { message: "code must be exactly 8 characters long" })
  code: string;
}
