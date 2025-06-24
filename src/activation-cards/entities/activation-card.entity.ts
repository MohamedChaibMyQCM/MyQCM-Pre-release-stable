import { ChronoEntity } from "abstract/base-chrono.entity";
import { Plan } from "src/plan/entities/plan.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, Index, ManyToOne } from "typeorm";

@Entity()
export class ActivationCard extends ChronoEntity {
  @Column({
    unique: true,
  })
  @Index({ unique: true })
  code: string;

  @Column({ default: false })
  is_redeemed: boolean;

  @Column({ nullable: true })
  redeemed_at?: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  redeemed_by?: User;

  @ManyToOne(() => Plan, { onDelete: "CASCADE" })
  plan: Plan;

  @Column({ nullable: true, default: null })
  expires_at?: Date;
}
