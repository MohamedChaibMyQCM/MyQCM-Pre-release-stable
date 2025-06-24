/**
 * Filter interface for user subscription queries
 * Note: For date comparisons, use TypeORM operators like LessThanOrEqual
 */
export class UserSubscriptionFilter {
  /** Whether the subscription is active */
  is_active?: boolean;
  /** Start date of the subscription */
  start_date?: Date | any;
  /** End date of the subscription */
  end_date?: Date | any;
}
