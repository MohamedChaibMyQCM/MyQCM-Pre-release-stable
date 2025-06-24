export interface ProgressFilters {
  user?: string;
  unit?: string;
  course?: string;
  subject?: string;
  session?: string;
  mcq?: string;
  time_spent_min?: number;
  time_spent_max?: number;
  success_ratio_min?: number;
  success_ratio_max?: number;
  response?: string;
  feedback?: string;
}
