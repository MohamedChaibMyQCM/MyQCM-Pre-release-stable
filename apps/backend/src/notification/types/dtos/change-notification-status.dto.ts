import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { NotificationUpdatableStatus } from "../enums/notification-status.enum";

export class ChangeNotificationStatusDto {
  @ApiProperty({ enum: NotificationUpdatableStatus })
  @IsEnum(NotificationUpdatableStatus)
  status: NotificationUpdatableStatus;
}
