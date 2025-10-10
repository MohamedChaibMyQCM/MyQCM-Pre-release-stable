import { ChronoEntity } from "abstract/base-chrono.entity";
import { YearOfStudy } from "src/user/types/enums/user-study-year.enum";
import { University } from "src/university/entities/university.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from "typeorm";
import { User } from "./user.entity";
import { StudyField } from "../types/enums/user-study-field.enum";
import { Unit } from "src/unit/entities/unit.entity";
import { Mode } from "src/mode/entities/mode.entity";

@Entity()
export class UserProfile extends ChronoEntity {
  @Column({
    type: "enum",
    enum: StudyField,
  })
  study_field: StudyField;

  @Column({
    type: "enum",
    enum: YearOfStudy,
  })
  year_of_study: YearOfStudy;

  @Column({ nullable: true })
  ending_date: Date;

  @ManyToOne(() => University, { onDelete: "SET NULL" })
  university: University;

  @ManyToOne(() => Unit, { onDelete: "SET NULL" })
  unit: Unit;

  @OneToOne(() => User, { onDelete: "CASCADE", nullable: false })
  @JoinColumn()
  @Index({ unique: true })
  user: User;

  @ManyToOne(() => Mode, { onDelete: "SET NULL", eager: true })
  @JoinColumn()
  mode: Mode;

  /*@Column({
    type: "enum",
    enum: FeedbackPreference,
  })
  feedback_preference: FeedbackPreference;

  @Column({
    type: "enum",
    enum: LearningStyle,
  })
  learning_style: LearningStyle;

  @Column({
    type: "varchar",
    length: 50,
  })
  learning_pace: string;

  @Column({
    type: "enum",
    enum: StudyHabit,
  })
  study_habits: StudyHabit;

  @Column({
    type: "enum",
    enum: ContentFormat,
  })
  prefered_content: ContentFormat;

  @Column({
    type: "enum",
    enum: ClinicalExperience,
  })
  clinical_experience: ClinicalExperience;

  @Column({
    type: "enum",
    enum: LearningGoal,
  })
  learning_goals: LearningGoal;

  @Column({
    type: "enum",
    enum: LearningPath,
  })
  learning_path: LearningPath;

  @Column({
    type: "enum",
    enum: MemoryRetention,
  })
  memory_retention: MemoryRetention;

  @Column({
    type: "enum",
    enum: AttentionSpan,
  })
  attention_span: AttentionSpan;


  @ManyToOne(() => Faculty)
  faculty: Faculty;*/
}
