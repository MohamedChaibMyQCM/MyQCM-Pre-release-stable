import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RewardCategory } from "./entities/reward-category.entity";
import { RewardPerk } from "./entities/reward-perk.entity";
import { RewardTransaction } from "./entities/reward-transaction.entity";
import { RewardAuction } from "./entities/reward-auction.entity";
import { RewardAuctionBid } from "./entities/reward-auction-bid.entity";
import { RewardCategoryService } from "./services/reward-category.service";
import { RewardPerkService } from "./services/reward-perk.service";
import { RewardTransactionService } from "./services/reward-transaction.service";
import { RewardAuctionService } from "./services/reward-auction.service";
import { RewardCategoryController } from "./controllers/reward-category.controller";
import { RewardPerkController } from "./controllers/reward-perk.controller";
import { RewardAuctionController } from "./controllers/reward-auction.controller";
import { RewardTransactionController } from "./controllers/reward-transaction.controller";
import { UserModule } from "src/user/user.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RewardCategory,
      RewardPerk,
      RewardTransaction,
      RewardAuction,
      RewardAuctionBid,
    ]),
    UserModule,
  ],
  controllers: [
    RewardCategoryController,
    RewardPerkController,
    RewardAuctionController,
    RewardTransactionController,
  ],
  providers: [
    RewardCategoryService,
    RewardPerkService,
    RewardTransactionService,
    RewardAuctionService,
  ],
  exports: [
    RewardCategoryService,
    RewardPerkService,
    RewardTransactionService,
    RewardAuctionService,
  ],
})
export class RewardModule {}
