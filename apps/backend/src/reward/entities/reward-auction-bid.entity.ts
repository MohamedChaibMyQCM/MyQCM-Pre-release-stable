import { ChronoEntity } from "abstract/base-chrono.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from "typeorm";
import { RewardAuction } from "./reward-auction.entity";
import { User } from "src/user/entities/user.entity";
import { RewardAuctionBidStatus } from "../enums/reward-auction-bid-status.enum";
import { RewardTransaction } from "./reward-transaction.entity";

@Entity()
export class RewardAuctionBid extends ChronoEntity {
  @ManyToOne(() => RewardAuction, (auction) => auction.bids, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn()
  @Index()
  auction: RewardAuction;

  @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn()
  @Index()
  bidder: User;

  @Column({ type: "int" })
  amount: number;

  @Column({
    type: "enum",
    enum: RewardAuctionBidStatus,
    default: RewardAuctionBidStatus.ACTIVE,
  })
  status: RewardAuctionBidStatus;

  @Column({ type: "boolean", default: false })
  isWinning: boolean;

  @OneToOne(() => RewardTransaction, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn()
  transaction?: RewardTransaction;
}
