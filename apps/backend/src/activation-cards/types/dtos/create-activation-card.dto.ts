import { IsDateString, IsOptional, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateActivationCardDto {
  @ApiProperty({
    description: "UUID of the plan",
    example: "123e4567-e89b-12d3-a456-426614174000",
    format: "uuid",
  })
  @IsUUID()
  plan: string;

  @ApiProperty({
    description:
      "Expiration date of the activation card (if not provided the card wont expire at all)",
    example: "2023-12-31T23:59:59Z",
    format: "date-time",
  })
  @IsOptional()
  @IsDateString()
  expires_at: Date;
}
