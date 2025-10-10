import { IsEmail } from "class-validator";

export class UpdateEmailDto {
  @IsEmail()
  new_email: string;
}
