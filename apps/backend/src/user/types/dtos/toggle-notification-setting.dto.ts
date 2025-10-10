import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { NotificationSettingsEnum } from "../enums/notification-settings.enum";
export class ToggleNotificationSettingDto {
  @ApiProperty({
    description: "The setting to toggle.",
    enum: NotificationSettingsEnum,
  })
  @IsEnum(NotificationSettingsEnum)
  setting: NotificationSettingsEnum;
}
