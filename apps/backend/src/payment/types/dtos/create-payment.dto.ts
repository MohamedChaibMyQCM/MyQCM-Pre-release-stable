import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

export class CreatePaymentDto {
  @ApiProperty({
    description: "The plan id to subscribe to",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  plan: string;
}
