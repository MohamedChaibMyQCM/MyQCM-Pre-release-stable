import { IsEnum } from "class-validator";
import { TransactionStatus } from "./transaction.type";
import { ApiProperty } from "@nestjs/swagger";
export class UpdateTransactionStatus {
  @ApiProperty({ description: "Transaction new status", example: "completed" })
  @IsEnum(TransactionStatus)
  status: TransactionStatus;
}
