import {
  IsEmail,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsString,
  IsNumber,
} from "class-validator";

export class CreateFormationDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  year_of_study: string;

  @IsEmail()
  email: string;

  @IsNumber()
  phoneNumber: number;

  @IsBoolean()
  isRegistered: boolean;

  @IsOptional()
  @IsString()
  comment?: string;
}
