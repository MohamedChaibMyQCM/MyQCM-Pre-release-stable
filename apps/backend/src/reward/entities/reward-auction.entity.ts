import { ChronoEntity } from "abstract/base-chrono.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from "typeorm";
import { RewardAuctionBid } from "./reward-auction-bid.entity";
import { RewardAuctionStatus } from "../enums/reward-auction-status.enum";
import { Admin } from "src/admin/entities/admin.entity";

@Entity()
export class RewardAuction extends ChronoEntity {
  @Column({ type: "varchar", length: 180 })
  title: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "varchar", length: 160, nullable: true })
  partner?: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  imageUrl?: string;

  @Column({ type: "int", default: 0 })
  startingBid: number;

  @Column({ type: "int", default: 10 })
  minimumIncrement: number;

  @Column({ type: "enum", enum: RewardAuctionStatus, default: RewardAuctionStatus.DRAFT })
  @Index()
  status: RewardAuctionStatus;

  @Column({ type: "timestamptz", nullable: true })
  startsAt?: Date;

  @Column({ type: "timestamptz", nullable: true })
  endsAt?: Date;

  @ManyToOne(() => Admin, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn()
  createdBy?: Admin;

  @OneToMany(() => RewardAuctionBid, (bid) => bid.auction)
  bids: RewardAuctionBid[];

  @OneToOne(() => RewardAuctionBid, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn()
  winningBid?: RewardAuctionBid;

  @Column({ type: "int", default: 0 })
  currentBidAmount: number;

  @Column({ type: "uuid", nullable: true })
  currentLeaderId?: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, unknown>;
}
