import { PlanPeriod } from "../dtos/plan.type";

export interface PlanFilters {
  name?: string;
  is_default?: boolean;
  is_alpha?: boolean;
  explanations?: boolean;
  notifications?: boolean;
  analysis?: boolean;
  period?: PlanPeriod;
  price_min?: number;
  price_max?: number;
  mcqs_min?: number;
  mcqs_max?: number;
  qrocs_min?: number;
  qrocs_max?: number;
  devices_min?: number;
  devices_max?: number;
}
