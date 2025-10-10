import { ChronoEntity } from "abstract/base-chrono.entity";
import { Course } from "src/course/entities/course.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { TrainingSessionStatus } from "../types/enums/training-session.enum";
import { McqDifficulty } from "src/mcq/dto/mcq.type";

@Entity()
export class TrainingSession extends ChronoEntity {
  @Column({
    nullable: true,
  })
  title: string;

  @Column({
    type: "boolean",
    default: true,
  })
  qcm: boolean;

  @Column({
    type: "boolean",
    default: true,
  })
  qcs: boolean;

  @Column({
    type: "boolean",
    default: true,
  })
  qroc: boolean;

  @Column({
    type: "enum",
    enum: McqDifficulty,
    nullable: true,
  })
  difficulty?: McqDifficulty | null;

  @Column({
    nullable: true, // use mcq original
  })
  time_limit: number;

  @Column({
    default: 1,
  })
  number_of_questions: number;

  @Column({
    default: true,
  })
  randomize_questions_order: boolean;

  @Column({
    default: true,
  })
  randomize_options_order: boolean;

  @Column({
    type: "enum",
    enum: TrainingSessionStatus,
    default: TrainingSessionStatus.IN_PROGRESS,
  })
  status: TrainingSessionStatus;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  scheduled_at: Date;

  @Column({
    nullable: true,
  })
  completed_at: Date;

  @Column({ type: "integer", default: 0 })
  total_mcqs: number;

  @Column({ type: "integer", default: 0 })
  correct_answers: number;

  @Column({ type: "integer", default: 0 })
  incorrect_answers: number;

  @Column({ type: "float", default: 0 })
  accuracy: number;

  @Column({ type: "integer", default: 0 })
  xp_earned: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Course)
  course: Course;
}
