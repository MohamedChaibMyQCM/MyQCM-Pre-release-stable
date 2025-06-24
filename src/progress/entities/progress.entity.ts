import { ChronoEntity } from "abstract/base-chrono.entity";
import { Course } from "src/course/entities/course.entity";
import { Mcq } from "src/mcq/entities/mcq.entity";
import { Subject } from "src/subject/entities/subject.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { SelectedOptionInterface } from "../types/interfaces/selected-option.interface";
import { Unit } from "src/unit/entities/unit.entity";
import { TrainingSession } from "src/training-session/entities/training-session.entity";

@Entity()
@Index(["user"])
export class Progress extends ChronoEntity {
  @ManyToOne(() => TrainingSession, { onDelete: "CASCADE", nullable: true })
  session: TrainingSession;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Unit, { onDelete: "SET NULL", nullable: true })
  @JoinColumn()
  unit: Unit;

  @ManyToOne(() => Course, { onDelete: "SET NULL", nullable: true })
  @JoinColumn()
  course: Course;

  @ManyToOne(() => Subject, { onDelete: "SET NULL", nullable: true })
  subject: Subject;

  @ManyToOne(() => Mcq, { onDelete: "CASCADE" })
  @JoinColumn()
  mcq: Mcq;

  @Column({
    type: "text",
    nullable: true,
  })
  feedback: string;

  @Column({
    type: "integer",
    nullable: true,
  })
  time_spent?: number;

  @Column({
    nullable: true,
  }) // for qroc type
  response: string;

  @Column("jsonb", { nullable: true }) // for qcm type
  selected_options?: SelectedOptionInterface[];

  @Column({ type: "int", default: 0 })
  gained_xp: number;
  @Column({
    type: "float",
    nullable: true,
  })
  success_ratio?: number;

  @Column({
    type: "boolean",
    default: false,
    comment: "if the user has skipped this mcq",
  })
  is_skipped: boolean;
}
