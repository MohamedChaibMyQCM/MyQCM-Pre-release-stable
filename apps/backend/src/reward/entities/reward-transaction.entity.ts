import { ChronoEntity } from "abstract/base-chrono.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { RewardTransactionType } from "../enums/reward-transaction-type.enum";
import { RewardTransactionStatus } from "../enums/reward-transaction-status.enum";
import { RewardPerk } from "./reward-perk.entity";
import { RewardAuction } from "./reward-auction.entity";

@Entity()
export class RewardTransaction extends ChronoEntity {
  @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn()
  @Index()
  user: User;

  @ManyToOne(() => RewardPerk, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn()
  perk?: RewardPerk;

  @ManyToOne(() => RewardAuction, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn()
  auction?: RewardAuction;

  @Column({
    type: "enum",
    enum: RewardTransactionType,
  })
  type: RewardTransactionType;

  @Column({
    type: "enum",
    enum: RewardTransactionStatus,
    default: RewardTransactionStatus.PENDING,
  })
  status: RewardTransactionStatus;

  @Column({ type: "int" })
  amount: number;

  @Column({ type: "varchar", length: 180, nullable: true })
  description?: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, unknown>;

  @Column({ type: "varchar", length: 120, nullable: true })
  reference?: string;
}
