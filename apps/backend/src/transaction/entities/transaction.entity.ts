import { ChronoEntity } from "abstract/base-chrono.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { TransactionStatus, TransactionType } from "../dto/transaction.type";
import { Freelancer } from "src/freelancer/entities/freelancer.entity";
import { Mcq } from "src/mcq/entities/mcq.entity";

@Entity()
export class Transaction extends ChronoEntity {
  @ManyToOne(() => Freelancer, (freelancer) => freelancer.transactions)
  @JoinColumn()
  freelancer: Freelancer;

  @ManyToOne(() => Mcq, { nullable: true, onDelete: "SET NULL" })
  mcq: Mcq;

  @Column({
    type: "numeric",
    precision: 10,
    scale: 2,
    default: 0,
  })
  amount: number;

  @Column({
    type: "date",
    nullable: true,
  })
  payment_date: Date;

  @Column({
    type: "enum",
    enum: TransactionType,
    default: TransactionType.credit,
  })
  type: TransactionType;

  @Column({
    nullable: true,
  })
  ccp?: string;

  @Column({
    type: "enum",
    enum: TransactionStatus,
    default: TransactionStatus.pending,
  })
  status: TransactionStatus;
}
