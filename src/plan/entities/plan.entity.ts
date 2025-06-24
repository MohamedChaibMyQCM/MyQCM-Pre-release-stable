import { ChronoEntity } from "abstract/base-chrono.entity";
import { Column, Entity } from "typeorm";
import { PlanPeriod } from "../types/dtos/plan.type";

@Entity()
export class Plan extends ChronoEntity {
  @Column({
    type: "varchar",
  })
  name: string;

  @Column({
    type: "numeric",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  price: number;

  @Column({
    type: "numeric",
    nullable: true,
  })
  mcqs: number | null; // null refers to unlimited

  @Column({
    type: "numeric",
    nullable: true,
  })
  qrocs: number | null; // null refers to unlimited

  @Column({
    default: false,
  })
  explanations: boolean;

  @Column({
    default: false,
  })
  notifications: boolean;

  @Column({
    default: true,
  })
  analysis: boolean;

  @Column({
    default: 1,
  })
  devices: number;

  @Column({
    type: "int",
    default: 0,
  })
  xp_reward: number;

  @Column({
    default: false,
  })
  is_default: boolean;

  @Column({
    type: "enum",
    enum: PlanPeriod,
    default: PlanPeriod.MONTHLY,
  })
  period: PlanPeriod;
}
