import { ChronoEntity } from "abstract/base-chrono.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Freelancer } from "src/freelancer/entities/freelancer.entity";
import { University } from "src/university/entities/university.entity";
import { Faculty } from "src/faculty/entities/faculty.entity";
import { Unit } from "src/unit/entities/unit.entity";
import { Subject } from "src/subject/entities/subject.entity";
import { Course } from "src/course/entities/course.entity";
import { YearOfStudy } from "src/user/types/enums/user-study-year.enum";
import { McqDifficulty } from "src/mcq/dto/mcq.type";
import { GenerationItem } from "./generation-item.entity";
import { GenerationRequestStatus } from "../enums/generation-request-status.enum";

@Entity()
export class GenerationRequest extends ChronoEntity {
  @ManyToOne(() => Freelancer, (freelancer) => freelancer.generationRequests, {
    eager: false,
  })
  freelancer: Freelancer;

  @ManyToOne(() => University, { eager: false })
  university: University;

  @ManyToOne(() => Faculty, { eager: false })
  faculty: Faculty;

  @Column({
    type: "enum",
    enum: YearOfStudy,
  })
  year_of_study: YearOfStudy;

  @ManyToOne(() => Unit, { eager: false, nullable: true })
  unit: Unit;

  @ManyToOne(() => Subject, { eager: false, nullable: false })
  subject: Subject;

  @ManyToOne(() => Course, { eager: false, nullable: false })
  course: Course;

  @Column({
    type: "enum",
    enum: McqDifficulty,
    default: McqDifficulty.medium,
  })
  difficulty: McqDifficulty;

  @Column({
    type: "int",
    default: 0,
  })
  requested_mcq_count: number;

  @Column({
    type: "int",
    default: 0,
  })
  requested_qroc_count: number;

  @Column({
    type: "text",
    array: true,
    default: () => "ARRAY[]::text[]",
  })
  content_types: string[];

  @Column({
    type: "enum",
    enum: GenerationRequestStatus,
    default: GenerationRequestStatus.AWAITING_UPLOAD,
  })
  status: GenerationRequestStatus;

  @Column({
    nullable: true,
  })
  source_file_name: string | null;

  @Column({
    nullable: true,
  })
  source_file_mime: string | null;

  @Column({
    type: "bigint",
    nullable: true,
  })
  source_file_size: number | null;

  @Column({
    nullable: true,
  })
  source_file_url: string | null;

  @Column({
    nullable: true,
  })
  source_file_public_id: string | null;

  @Column({
    nullable: true,
  })
  source_file_openai_id: string | null;

  @Column({
    type: "timestamp",
    nullable: true,
  })
  uploaded_at: Date | null;

  @OneToMany(() => GenerationItem, (item) => item.request, {
    cascade: true,
  })
  items: GenerationItem[];
}
