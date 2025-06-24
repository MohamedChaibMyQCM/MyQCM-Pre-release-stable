import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { NotificationType } from "../enums/notification-type.enum";
import { NotificationStatus } from "../enums/notification-status.enum";
import { NotificationChannel } from "../enums/notification-channel.enum";

export class CreateNotificationDto {
  @IsString()
  content: string;

  @IsEnum(NotificationType)
  notification_type: NotificationType;

  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @IsOptional()
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @IsOptional()
  @IsDateString()
  send_at?: Date;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  link?: string;
}
