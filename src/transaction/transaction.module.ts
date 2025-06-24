import { Module } from "@nestjs/common";
import { TransactionService } from "./transaction.service";
import { TransactionController } from "./transaction.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Transaction } from "./entities/transaction.entity";
import { WalletModule } from "src/wallet/wallet.module";
import { FreelancerModule } from "src/freelancer/freelancer.module";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    WalletModule,
    FreelancerModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
