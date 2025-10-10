import { ChronoEntity } from "abstract/base-chrono.entity";
import { University } from "src/university/entities/university.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { FacultyType } from "../types/enums/faculty-type.enum";
import { getEnvOrFatal } from "common/utils/env.util";

@Entity()
export class Faculty extends ChronoEntity {
  @Column()
  name: string;
  @Column({
    nullable: true,
  })
  description: string;

  @Column({
    default: getEnvOrFatal("DEFAULT_FACULTY_AVATAR"),
    nullable: true,
  })
  attachment: string;

  @Column({
    type: "enum",
    enum: FacultyType,
    default: FacultyType.general_medicine,
  })
  type: FacultyType;

  @ManyToOne(() => University, {
    onDelete: "CASCADE",
  })
  university: University;
}
