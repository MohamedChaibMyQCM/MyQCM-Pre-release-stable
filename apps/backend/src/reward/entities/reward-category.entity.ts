import { ChronoEntity } from "abstract/base-chrono.entity";
import {
  Column,
  Entity,
  Index,
  OneToMany,
  Unique,
} from "typeorm";
import { RewardPerk } from "./reward-perk.entity";

@Entity()
@Unique(["slug"])
export class RewardCategory extends ChronoEntity {
  @Column({ type: "varchar", length: 120 })
  name: string;

  @Column({ type: "varchar", length: 150 })
  slug: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "int", default: 0 })
  @Index()
  sortOrder: number;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @OneToMany(() => RewardPerk, (perk) => perk.category)
  perks: RewardPerk[];
}
