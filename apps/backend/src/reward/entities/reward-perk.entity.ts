import { ChronoEntity } from "abstract/base-chrono.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { RewardCategory } from "./reward-category.entity";

@Entity()
export class RewardPerk extends ChronoEntity {
  @Column({ type: "varchar", length: 160 })
  title: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "int" })
  @Index()
  xpCost: number;

  @Column({ type: "int", nullable: true })
  maxRedemptions?: number;

  @Column({ type: "int", default: 0 })
  redeemedCount: number;

  @Column({ type: "int", nullable: true })
  stock?: number;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, unknown>;

  @Column({ type: "int", default: 0 })
  creditMcqs: number;

  @Column({ type: "int", default: 0 })
  creditQrocs: number;

  @ManyToOne(() => RewardCategory, (category) => category.perks, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn()
  category: RewardCategory;
}
