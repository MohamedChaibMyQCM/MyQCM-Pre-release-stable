import { IsEmail, IsStrongPassword } from "class-validator";

export class SigninAdminDto {
  @IsEmail()
  email: string;
  @IsStrongPassword()
  password: string;
}
