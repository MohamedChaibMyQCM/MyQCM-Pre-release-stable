import { SemiChronoEntity } from "abstract/base-semi-chrono.entity";
import { Entity, Column } from "typeorm";

@Entity()
export class File extends SemiChronoEntity {
  @Column()
  fieldname: string;

  @Column()
  originalname: string; // Original name from the client

  @Column()
  filename: string; // Local or original file name

  @Column()
  mimetype: string;

  @Column()
  size: number; // In bytes

  @Column({ nullable: true })
  path: string;
}
