import { ChronoEntity } from "abstract/base-chrono.entity";
import { Column, Entity, Index, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";
import { DateUtils } from "common/utils/date.util";

@Entity()
export class UserStreak extends ChronoEntity {
  @Column({ default: 1 })
  current_streak: number;

  @Column({ default: 1 })
  longest_streak: number;

  @Column({ nullable: true, default: () => "CURRENT_TIMESTAMP" })
  last_streak_date: Date;

  @OneToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn()
  @Index({ unique: true })
  user: User;
}
