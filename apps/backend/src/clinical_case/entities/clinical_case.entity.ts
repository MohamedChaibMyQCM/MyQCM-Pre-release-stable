import { ChronoEntity } from "abstract/base-chrono.entity";
import { YearOfStudy } from "src/user/types/enums/user-study-year.enum";
import { Faculty } from "src/faculty/entities/faculty.entity";
import { Freelancer } from "src/freelancer/entities/freelancer.entity";
import { McqType } from "src/mcq/dto/mcq.type";
import { Subject } from "src/subject/entities/subject.entity";
import { Unit } from "src/unit/entities/unit.entity";
import { University } from "src/university/entities/university.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { FacultyType } from "src/faculty/types/enums/faculty-type.enum";
import { Mcq } from "src/mcq/entities/mcq.entity";

@Entity()
export class ClinicalCase extends ChronoEntity {
  @Column()
  title: string;

  @Column({
    type: "enum",
    enum: FacultyType,
    default: FacultyType.general_medicine,
  })
  faculty_type: FacultyType;

  @Column({
    type: "enum",
    enum: YearOfStudy,
    default: YearOfStudy.first_year,
  })
  year_of_study: YearOfStudy;

  @Column()
  author: string;

  @Column()
  description: string;

  @Column()
  scenario: string;

  @Column({
    type: "text",
    array: true,
    default: () => "ARRAY[]::text[]",
  })
  objectives: string[];

  @Column({
    type: "text",
    array: true,
    default: () => "ARRAY[]::text[]",
  })
  tags: string[];

  @Column({
    type: "enum",
    enum: McqType,
    default: McqType.qcm,
    nullable: false,
  })
  type: McqType;

  @ManyToOne(() => University, {
    onDelete: "SET NULL",
  })
  university: University;

  @ManyToOne(() => Faculty, {
    onDelete: "SET NULL",
  })
  faculty: Faculty;

  @ManyToOne(() => Unit, {
    onDelete: "SET NULL",
  })
  unit: Unit;

  @ManyToOne(() => Subject, {
    onDelete: "SET NULL",
  })
  subject: Subject;

  @ManyToOne(() => Freelancer, {
    onDelete: "SET NULL",
  })
  freelancer: Freelancer;

  @OneToMany(() => Mcq, (mcq) => mcq.clinical_case, {
    cascade: false,
  })
  mcqs: Mcq[];

  @Column({
    type: "smallint",
    nullable: true,
  })
  promo: number;
}
