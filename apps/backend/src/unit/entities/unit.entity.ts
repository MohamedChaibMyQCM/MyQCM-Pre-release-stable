import { ChronoEntity } from "abstract/base-chrono.entity";
import { YearOfStudy } from "src/user/types/enums/user-study-year.enum";
import { Column, Entity } from "typeorm";

@Entity()
export class Unit extends ChronoEntity {
  @Column({
    type: "varchar",
    length: 100,
    nullable: false,
    //default: "Unknown",
  })
  name: string;

  @Column({
    type: "text",
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
    type: "varchar",
    length: 255,
    nullable: true,
    default: null,
  })
  attachment: string;
}
