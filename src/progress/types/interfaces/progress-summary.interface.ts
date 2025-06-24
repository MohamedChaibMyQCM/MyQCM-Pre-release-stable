export interface ProgressSummaryInterface {
  total_mcqs_attempted: number;
  overall_accuracy: {
    percentage: number;
    trend: number;
  };
  average_time_spent: number;
}
