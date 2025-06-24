import { Entity, Column, ManyToOne } from "typeorm";
import { User } from "src/user/entities/user.entity";
import { Plan } from "src/plan/entities/plan.entity";
import { ChronoEntity } from "abstract/base-chrono.entity";
import { PaymentStatus } from "../types/enums/payment-status.enum";
import { ChargilyPaymentMethods } from "../types/enums/payment-method.enum";

@Entity()
export class Payment extends ChronoEntity {
  @Column()
  checkout_id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Plan)
  plan: Plan;

  @Column({
    type: "numeric",
    precision: 10,
    scale: 2,
    default: 0,
  })
  amount: number;

  @Column({ type: "enum", enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({
    type: "enum",
    enum: ChargilyPaymentMethods,
    default: ChargilyPaymentMethods.EDAHABIA,
  })
  payment_method: ChargilyPaymentMethods;

  @Column({ nullable: true })
  deposit_transaction_id: number;

  @Column({ default: false })
  livemode: boolean;

  @Column({ nullable: true })
  fees: number;

  @Column({ nullable: true })
  fees_on_customer: number;

  @Column({ nullable: true })
  fees_on_merchant: number;

  @Column({ nullable: true })
  paid_at: Date;
}
