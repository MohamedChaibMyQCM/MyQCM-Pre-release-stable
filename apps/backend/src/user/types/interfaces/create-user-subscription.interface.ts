import { UserSubscriptionSource } from "../enums/user-subscription-source.enum";

export interface CreateUserSubscriptionInterface {
  plan?: string;
  end_date?: Date;
  source?: UserSubscriptionSource;
}
