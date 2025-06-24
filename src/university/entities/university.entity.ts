import { ChronoEntity } from "abstract/base-chrono.entity";
import { getEnvOrFatal } from "common/utils/env.util";
import { Column, Entity } from "typeorm";

@Entity()
export class University extends ChronoEntity {
  @Column()
  name: string;
  @Column({
    nullable: true,
  })
  description: string;

  @Column({
    default: false,
  })
  has_access: boolean;

  @Column({
    nullable: true,
  })
  location: string;

  @Column({
    default: getEnvOrFatal("DEFAULT_UNIVERSITY_AVATAR"),
    nullable: true,
  })
  attachment: string;
}
