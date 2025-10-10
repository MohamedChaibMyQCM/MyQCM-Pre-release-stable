import { NotificationType } from "../enums/notification-type.enum";

export interface NotificationFilters {
  notification_type?: NotificationType;
  is_read?: boolean;
}
