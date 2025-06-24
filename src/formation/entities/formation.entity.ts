import { ChronoEntity } from "abstract/base-chrono.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("formation")
export class FormationEntity extends ChronoEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  year_of_study: string;

  @Column()
  phoneNumber: number;

  @Column()
  isRegistered: boolean;

  @Column({ nullable: true })
  comment: string;
}
