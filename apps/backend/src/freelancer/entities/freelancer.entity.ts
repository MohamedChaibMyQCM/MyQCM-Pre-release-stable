import { ChronoEntity } from "abstract/base-chrono.entity";
import { BaseRoles } from "shared/enums/base-roles.enum";
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
} from "typeorm";
import * as bcrypt from "bcrypt";
import { Mcq } from "src/mcq/entities/mcq.entity";
import { Wallet } from "src/wallet/entities/wallet.entity";
import { Transaction } from "src/transaction/entities/transaction.entity";
import { ClinicalCase } from "src/clinical_case/entities/clinical_case.entity";
import { GenerationRequest } from "src/generation/entities/generation-request.entity";
@Entity()
export class Freelancer extends ChronoEntity {
  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
    default: null,
  })
  image: string;

  @Column({
    type: "varchar",
    length: 100,
    nullable: false,
  })
  name: string;

  @Index({ unique: true })
  @Column({
    type: "varchar",
    length: 100,
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: false,
    select: false,
  })
  password: string;

  @Column({
    type: "varchar",
    nullable: true,
    default: null,
    select: false,
    unique: true,
  })
  code: string;

  @Column({
    type: "boolean",
    default: false,
  })
  is_verified: boolean;

  @OneToOne(() => Wallet, (wallet) => wallet.freelancer)
  wallet: Wallet;

  @OneToMany(() => Transaction, (transaction) => transaction.freelancer)
  transactions: Transaction[];

  @OneToMany(
    () => GenerationRequest,
    (generationRequest) => generationRequest.freelancer,
  )
  generationRequests: GenerationRequest[];

  @Column({
    type: "enum",
    enum: BaseRoles,
    default: BaseRoles.FREELANCER,
  })
  role: BaseRoles;
}
