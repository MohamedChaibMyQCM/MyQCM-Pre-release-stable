import { IsEmail } from "class-validator";

export class CreateEmailWaitingListDto {
  @IsEmail()
  email: string;
}
