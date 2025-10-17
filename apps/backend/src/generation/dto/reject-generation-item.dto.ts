import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class RejectGenerationItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

