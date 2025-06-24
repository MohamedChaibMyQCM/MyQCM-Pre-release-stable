export interface ActivationCardFilters {
  is_redeemed?: boolean;
  plan?: string;
  redeemed_by?: string;
  redeemed_at?: Date;
  expires_at?: Date;
}
