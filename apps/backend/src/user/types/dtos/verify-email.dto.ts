import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";

export class VerifyEmailDto {
  @ApiProperty({
    description: "The code sent to the user's email",
    example: "123456",
  })
  @IsString()
  @Length(6, 6, { message: "code should be 6 digits exact" })
  code: string;
}
