import { ChronoEntity } from "abstract/base-chrono.entity";
import { Column, Entity, Index, ManyToOne } from "typeorm";
import { ClinicalCase } from "./clinical_case.entity";
import { User } from "src/user/entities/user.entity";

@Entity()
@Index(["case_identifier", "user"], { unique: true })
export class ClinicalCaseFeedback extends ChronoEntity {
  @Column({ type: "varchar", length: 255 })
  case_identifier: string;

  @Column({ type: "smallint" })
  rating: number;

  @Column({ type: "text", nullable: true })
  review: string | null;

  @ManyToOne(() => ClinicalCase, { nullable: true, onDelete: "SET NULL" })
  clinical_case: ClinicalCase | null;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  user: User | null;
}
