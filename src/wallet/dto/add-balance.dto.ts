import { IsNumber, IsOptional, IsPositive, IsUUID } from "class-validator";

export class AddBalanceDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsUUID("4")
  freelancer: string;
}
export class SubtractBalance extends AddBalanceDto {}
