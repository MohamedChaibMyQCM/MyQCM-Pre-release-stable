import { ChronoEntity } from "abstract/base-chrono.entity";
import { Column, Entity } from "typeorm";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { AdminScope } from "../enums/admin-scope.enum";
@Entity()
export class Admin extends ChronoEntity {
  @Column({
    type: "varchar",
    length: 100,
    unique: true,
    nullable: true,
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
    type: "enum",
    enum: BaseRoles,
    default: BaseRoles.ADMIN,
  })
  role: BaseRoles.ADMIN;

  @Column({
    type: "enum",
    enum: AdminScope,
    array: true,
    default: [AdminScope.SUPER],
  })
  scopes: AdminScope[];
}
