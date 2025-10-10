import { IsStrongPassword, Matches } from "class-validator";

export class ValidatePasswordResetDto {
  @Matches(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/, {
    message: "Invalid token format.",
  })
  token: string;

  @IsStrongPassword()
  password: string;
}
