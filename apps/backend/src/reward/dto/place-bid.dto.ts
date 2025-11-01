import { IsInt, IsPositive } from "class-validator";

export class PlaceBidDto {
  @IsInt()
  @IsPositive()
  amount: number;
}
