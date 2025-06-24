import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsStrongPassword } from "class-validator";

export class ChangePasswordDto {
  @ApiProperty({
    description: "The old password",
    example: "Strong@Password123",
  })
  @IsString()
  old_password: string;

  @ApiProperty({
    description: "The new password",
    example: "Strong@Password123",
  })
  @IsStrongPassword()
  new_password: string;
}
