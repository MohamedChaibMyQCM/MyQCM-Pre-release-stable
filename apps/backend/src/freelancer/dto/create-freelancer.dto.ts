import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Matches,
} from "class-validator";

export class SignupFreelancerDto {
  @ApiProperty({ description: "freelancer full name" })
  @Matches(/^[a-zA-Z]+(?: [a-zA-Z]+)+$/, {
    message: "name must be a correct full name",
  })
  name: string;

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

  @ApiProperty({
    description: "freelancer login code",
    example: "1234...",
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  code: string;
}
