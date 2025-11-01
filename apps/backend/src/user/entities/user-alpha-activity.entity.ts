import { ChronoEntity } from "abstract/base-chrono.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";

/**
 * Tracks user activity in alpha/labs features for XP rewards
 */
@Entity()
export class UserAlphaActivity extends ChronoEntity {
  @Column({ type: "varchar", length: 100 })
  feature_id: string;

  @Column({ type: "varchar", length: 255 })
  feature_name: string;

  @Column({ type: "int", default: 0 })
  testing_xp: number;

  @Column({ type: "int", default: 0 })
  time_spent_xp: number;

  @Column({ type: "int", default: 0 })
  feedback_quality_xp: number;

  @Column({ type: "int", default: 0 })
  total_xp_earned: number;

  @Column({ type: "int", default: 0 })
  time_spent_seconds: number;

  @Column({ type: "int", nullable: true })
  feedback_rating: number;

  @Column({ type: "text", nullable: true })
  feedback_text: string;

  @Column({ type: "boolean", default: false })
  xp_awarded: boolean;

  @Column({ type: "timestamp", nullable: true })
  started_at: Date;

  @Column({ type: "timestamp", nullable: true })
  completed_at: Date;

  @ManyToOne(() => User, { onDelete: "CASCADE", nullable: false })
  @JoinColumn()
  @Index("IDX_USER_ALPHA_ACTIVITY", ["userId"])
  user: User;
}
