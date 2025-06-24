import { IsEmail, IsStrongPassword } from "class-validator";

export class CreateAdminDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;
}
