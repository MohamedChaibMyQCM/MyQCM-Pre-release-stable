import { ChronoEntity } from "abstract/base-chrono.entity";
import { YearOfStudy } from "src/user/types/enums/user-study-year.enum";
import { Unit } from "src/unit/entities/unit.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { SubjectSemestre } from "../types/dto/subject.type";

@Entity()
export class Subject extends ChronoEntity {
  @Column()
  name: string;

  @Column({
    nullable: true,
  })
  description: string;

  @Column({
    type: "enum",
    enum: YearOfStudy,
    default: YearOfStudy.second_year,
    nullable: false,
  })
  year_of_study: YearOfStudy;

  @Column({
    type: "enum",
    enum: SubjectSemestre,
    nullable: true,
  })
  subject_semestre: SubjectSemestre;

  @ManyToOne(() => Unit, {
    onDelete: "CASCADE",
    nullable: true,
  })
  unit: Unit;

  @Column({
    default: null,
    nullable: true,
  })
  icon: string;

  @Column({
    default: null,
    nullable: true,
  })
  banner: string;
}
