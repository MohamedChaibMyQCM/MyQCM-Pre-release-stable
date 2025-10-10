import { ChronoEntity } from "abstract/base-chrono.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { UserActivityType } from "../types/enums/user-activity-type.enum";
import { SemiChronoEntity } from "abstract/base-semi-chrono.entity";

@Entity()
export class UserActivity extends SemiChronoEntity {
  @Column({
    type: "enum",
    enum: UserActivityType,
    default: UserActivityType.OTHERS,
  })
  activity_type: UserActivityType;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user: User;
}
