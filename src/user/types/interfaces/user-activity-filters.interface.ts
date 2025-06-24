import { UserActivityType } from "../enums/user-activity-type.enum";

export interface ActivityFilter {
  start_date?: Date;
  end_date?: Date;
  activity_type?: UserActivityType;
  user?: string;
}
