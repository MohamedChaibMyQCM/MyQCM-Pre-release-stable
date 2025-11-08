import { ChronoEntity } from "abstract/base-chrono.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Mcq } from "src/mcq/entities/mcq.entity";

@Entity({ name: "item_irt_params" })
@Index("UQ_item_irt_params_mcq_version", ["mcq", "version"], {
  unique: true,
})
@Index("IDX_item_irt_params_latest", ["mcq"], {
  unique: true,
  where: '"is_latest" = true',
})
export class ItemIrtParams extends ChronoEntity {
  @ManyToOne(() => Mcq, { onDelete: "CASCADE" })
  @JoinColumn({ name: "mcq_id" })
  mcq: Mcq;

  @Column({ type: "float" })
  discrimination: number;

  @Column({ type: "float" })
  difficulty: number;

  @Column({ type: "float" })
  guessing: number;

  @Column({ type: "varchar", length: 64, nullable: true })
  source?: string | null;

  @Column({ type: "varchar", length: 64 })
  version: string;

  @Column({ type: "boolean", default: true })
  is_latest: boolean;
}
