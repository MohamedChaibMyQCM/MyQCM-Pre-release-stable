import { ChronoEntity } from "abstract/base-chrono.entity";
import { Column, Entity } from "typeorm";
@Entity()
export class EmailWaitingList extends ChronoEntity {
  @Column()
  email: string;
}
