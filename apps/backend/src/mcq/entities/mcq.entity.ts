import { ChronoEntity } from "abstract/base-chrono.entity";
import { Column, Entity, Index, ManyToOne, OneToMany } from "typeorm";
import {
  McqApprovalStatus,
  McqDifficulty,
  McqTag,
  McqType,
  QuizType,
} from "../dto/mcq.type";
import { Freelancer } from "src/freelancer/entities/freelancer.entity";
import { Option } from "src/option/entities/option.entity";
import { University } from "src/university/entities/university.entity";
import { Faculty } from "src/faculty/entities/faculty.entity";
import { Unit } from "src/unit/entities/unit.entity";
import { Subject } from "src/subject/entities/subject.entity";
import { Course } from "src/course/entities/course.entity";
import { ClinicalCase } from "src/clinical_case/entities/clinical_case.entity";
import { YearOfStudy } from "src/user/types/enums/user-study-year.enum";

@Entity()
export class Mcq extends ChronoEntity {
  @Index(["type", "quiz_type", "difficulty"])
  @Column({
    type: "enum",
    enum: McqType,
    default: McqType.qcm,
  })
  type: McqType;

  @Column({
    type: "enum",
    enum: QuizType,
    default: QuizType.theorique,
  })
  quiz_type: QuizType;

  @Column({
    type: "simple-array",
    nullable: true,
  })
  keywords: string[];

  @Column({
    type: "enum",
    enum: McqTag,
    default: McqTag.others,
  })
  mcq_tags: McqTag;

  @Column({
    type: "enum",
    enum: McqApprovalStatus,
    default: McqApprovalStatus.APPROVED,
  })
  approval_status: McqApprovalStatus;

  @Column({
    type: "smallint",
    nullable: true,
    default: 10,
    comment: "Estimated time to solve the MCQ in seconds.",
  })
  estimated_time: number;

  @Column({
    type: "text",
  })
  question: string;

  @Column({
    nullable: true,
  })
  answer?: string;

  @Column({
    type: "float",
    default: "1",
  })
  baseline: number;

  @OneToMany(() => Option, (option) => option.mcq, { nullable: true })
  options: Option[];

  @Column({
    type: "text",
    nullable: true,
  })
  explanation: string;

  @Column({
    type: "enum",
    enum: McqDifficulty,
    default: McqDifficulty.medium,
  })
  difficulty: McqDifficulty;

  @Column({
    default: null,
    nullable: true,
  })
  attachment: string;

  @Column({
    type: "boolean",
    default: false,
  })
  in_clinical_case: boolean;

  @Column({
    type: "smallint",
    nullable: true,
  })
  promo: number;

  @Column({
    type: "enum",
    enum: YearOfStudy,
    default: YearOfStudy.first_year,
  })
  year_of_study: YearOfStudy;

  @ManyToOne(() => Freelancer, {
    onDelete: "SET NULL",
    nullable: true,
  })
  freelancer: Freelancer;

  @ManyToOne(() => University, {
    onDelete: "SET NULL",
    nullable: true,
  })
  university: University;

  @ManyToOne(() => Faculty, {
    nullable: true,
    onDelete: "SET NULL",
  })
  faculty: Faculty;

  @ManyToOne(() => Unit, {
    onDelete: "SET NULL",
    nullable: true,
  })
  unit: Unit;

  @ManyToOne(() => Subject, {
    onDelete: "SET NULL",
    nullable: true,
  })
  subject: Subject;

  @ManyToOne(() => Course, {
    onDelete: "SET NULL",
    nullable: true,
  })
  course: Course;

  @ManyToOne(() => ClinicalCase, {
    onDelete: "SET NULL",
    nullable: true,
  })
  clinical_case: ClinicalCase;
}
