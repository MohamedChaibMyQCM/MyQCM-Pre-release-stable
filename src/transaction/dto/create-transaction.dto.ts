import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsUUID,
  Matches,
} from "class-validator";
import { TransactionStatus } from "./transaction.type";
import { Mcq } from "src/mcq/entities/mcq.entity";

export class CreateCreditTransactionDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsUUID("4")
  mcq: Mcq;
}
export class CreateWithdrawTransactionDto {
  @ApiProperty({ description: "amount to withdraw" })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsNotEmpty()
  @ApiProperty({ description: "user ccp to withdraw money in it " })
  @Matches(/^\d{20}$/, {
    message:
      "Invalid CCP account number. It should be a string of exactly 20 digits.",
  })
  ccp?: string;
}
