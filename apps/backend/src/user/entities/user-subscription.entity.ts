import { SemiChronoEntity } from "abstract/base-semi-chrono.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { Plan } from "src/plan/entities/plan.entity";
import { UserSubscriptionSource } from "../types/enums/user-subscription-source.enum";

@Entity()
export class UserSubscription extends SemiChronoEntity {
  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user: User;

  @ManyToOne(() => Plan, { onDelete: "CASCADE", eager: true })
  plan: Plan;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  start_date: Date;

  @Column({ type: "timestamptz", nullable: true }) // null refers to default plan UwU
  end_date: Date;

  @Column({
    type: "enum",
    enum: UserSubscriptionSource,
    default: UserSubscriptionSource.DEFAULT,
  })
  source: string;

  // track the user usage

  @Column({ type: "int", default: 0 })
  used_mcqs: number;

  @Column({ type: "int", default: 0 })
  used_qrocs: number;
}
