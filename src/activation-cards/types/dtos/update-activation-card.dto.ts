import { PartialType } from "@nestjs/swagger";
import { CreateActivationCardDto } from "./create-activation-card.dto";
import { IsDateString, IsOptional } from "class-validator";

export class UpdateActivationCardDto {
  @IsOptional()
  @IsDateString()
  expires_at?: Date;
}
