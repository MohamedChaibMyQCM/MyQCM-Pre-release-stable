import { ChronoEntity } from "abstract/base-chrono.entity";
import { Column, Entity, Index, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class UserXp extends ChronoEntity {
  @Column({ type: "int", default: 0 })
  xp: number;
  @OneToOne(() => User, { onDelete: "CASCADE", nullable: false })
  @JoinColumn()
  @Index("IDX_USER_XP", ["userId"], { unique: true })
  user: User;
}
