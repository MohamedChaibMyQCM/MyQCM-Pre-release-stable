import { IsInt, IsOptional, Min } from "class-validator";

export class PurchaseRewardPerkDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  notes?: string;
}
