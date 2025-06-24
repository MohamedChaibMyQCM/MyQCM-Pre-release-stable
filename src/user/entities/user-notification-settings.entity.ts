import { ChronoEntity } from "abstract/base-chrono.entity";
import { Column, Entity, Index, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class UserNotificationSettings extends ChronoEntity {
  @Column({
    type: "boolean",
    default: true,
  })
  email_notifications: boolean;

  @Column({
    type: "boolean",
    default: false,
  })
  news_and_updates: boolean;

  @Column({
    type: "boolean",
    default: true,
  })
  learning_reminders: boolean;

  @Column({
    type: "boolean",
    default: true,
  })
  subscription: boolean;

  @OneToOne(() => User, { onDelete: "CASCADE", nullable: false })
  @JoinColumn()
  @Index()
  user: User;
}
