import { Column, Entity, Index, ManyToOne } from "typeorm";
import { ChronoEntity } from "abstract/base-chrono.entity";
import { User } from "src/user/entities/user.entity";
import { NotificationType } from "../types/enums/notification-type.enum";
import { NotificationStatus } from "../types/enums/notification-status.enum";
import { NotificationChannel } from "../types/enums/notification-channel.enum";

@Entity()
export class Notification extends ChronoEntity {
  @Column({ type: "text", default: "No Content Provided" })
  content: string;

  @Column({
    type: "enum",
    enum: NotificationType,
    default: NotificationType.OTHERS,
  })
  notification_type: NotificationType;

  @Column({
    type: "text",
    nullable: true,
  })
  link?: string;

  @Column({
    type: "enum",
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Column({
    type: "enum",
    enum: NotificationChannel,
    default: NotificationChannel.OTHERS,
  })
  channel: NotificationChannel;

  @Column({
    //CHECK later if this is good and helpfull
    nullable: true,
  })
  send_at: Date;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @Index()
  user: User;
}
