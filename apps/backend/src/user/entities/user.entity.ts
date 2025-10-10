import { ChronoEntity } from "abstract/base-chrono.entity";
import { getEnvOrFatal } from "common/utils/env.util";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { Column, Entity, Index } from "typeorm";
@Entity()
export class User extends ChronoEntity {
  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
    default: getEnvOrFatal("DEFAULT_USER_AVATAR"),
  })
  avatar: string;

  @Column({
    type: "varchar",
    length: 100,
    nullable: false,
    default: "Unknown",
  })
  name: string;

  @Index({ unique: true })
  @Column({
    type: "varchar",
    length: 100,
    unique: true,
    nullable: false,
    default: "Unknown",
  })
  email: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
    select: false,
  })
  password: string;

  @Column({
    type: "boolean",
    default: false,
  })
  user_verified: boolean;

  @Column({
    type: "boolean",
    default: false,
  })
  email_verified: boolean;

  @Column({
    type: "boolean",
    default: false,
  })
  completed_introduction: boolean;
  @Column({
    default: BaseRoles.USER,
  })
  role: BaseRoles.USER;
}
