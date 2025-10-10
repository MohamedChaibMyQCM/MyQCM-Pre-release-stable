import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID, Matches } from "class-validator";

export class ConsumeActivationCardDto {
  @ApiProperty({
    description: "code of the activation card",
    example: "ABCD-1234-EFGH-5678-IJKL-9012",
  })
  @IsString()
  @Matches(/^[A-Za-z0-9]{4}(-[A-Za-z0-9]{4}){5}$/, {
    message: "Invalid code format",
  })
  code: string;
}
