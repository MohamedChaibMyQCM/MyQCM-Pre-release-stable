import { ChronoEntity } from "abstract/base-chrono.entity";
import { Freelancer } from "src/freelancer/entities/freelancer.entity";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";

@Entity()
export class Wallet extends ChronoEntity {
  @Column({
    type: "numeric",
    precision: 10,
    scale: 2,
    default: 0,
  })
  balance: number;

  @OneToOne(() => Freelancer, (freelancer) => freelancer.wallet, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  freelancer: Freelancer;
}
