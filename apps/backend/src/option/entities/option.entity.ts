import { ChronoEntity } from "abstract/base-chrono.entity";
import { Mcq } from "src/mcq/entities/mcq.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity()
export class Option extends ChronoEntity {
  @Column()
  content: string;

  @Column({
    nullable: false,
  })
  is_correct: boolean;

  @ManyToOne(() => Mcq, (mcq) => mcq, { onDelete: "CASCADE" })
  mcq: Mcq;
}
