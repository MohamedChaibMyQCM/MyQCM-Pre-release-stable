import { ChronoEntity } from "abstract/base-chrono.entity";
import { Column, Entity } from "typeorm";
import { ModeDefiner } from "../types/enums/mode-definier.enum";

@Entity()
export class Mode extends ChronoEntity {
  @Column({
    type: "varchar",
    length: 100,
    nullable: false,
    default: "Unknown",
  })
  name: string;

  @Column({
    type: "enum",
    enum: ModeDefiner,
    default: ModeDefiner.USER,
  })
  include_qcm_definer: ModeDefiner;

  @Column({
    type: "enum",
    enum: ModeDefiner,
    default: ModeDefiner.USER,
  })
  include_qcs_definer: ModeDefiner;

  @Column({
    type: "enum",
    enum: ModeDefiner,
    default: ModeDefiner.USER,
  })
  include_qroc_definer: ModeDefiner;

  @Column({
    type: "enum",
    enum: ModeDefiner,
    default: ModeDefiner.USER,
  })
  time_limit_definer: ModeDefiner;

  @Column({
    type: "enum",
    enum: ModeDefiner,
    default: ModeDefiner.USER,
  })
  number_of_questions_definer: ModeDefiner;

  @Column({
    type: "enum",
    enum: ModeDefiner,
    default: ModeDefiner.USER,
  })
  randomize_questions_order_definer: ModeDefiner;

  @Column({
    type: "enum",
    enum: ModeDefiner,
    default: ModeDefiner.USER,
  })
  randomize_options_order_definer: ModeDefiner;

  @Column({
    type: "enum",
    enum: ModeDefiner,
    default: ModeDefiner.USER,
  })
  difficulty_definer: ModeDefiner;
}
