import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Min, Max } from "class-validator";

export class ValidateUserEmailVerificationDto {
  @ApiProperty({
    description: "The OTP code sent to the user for email verification",
    example: 123456,
  })
  @IsNumber({}, { message: "OTP code must be a number." })
  @Min(100000, { message: "OTP code must be 6 digits." })
  @Max(999999, { message: "OTP code must be 6 digits." })
  otp_code: number;
}
