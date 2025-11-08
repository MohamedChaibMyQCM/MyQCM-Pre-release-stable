import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsStrongPassword,
} from "class-validator";
import { AdminScope } from "../enums/admin-scope.enum";

export class CreateAdminDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEnum(AdminScope, { each: true })
  scopes?: AdminScope[];
}
