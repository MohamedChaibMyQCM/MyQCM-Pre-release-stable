export interface AccuracyThresholdMatrix {
  [type: string]: {
    default?: number;
    [difficulty: string]: number | undefined;
  };
}

export interface AccuracyThresholdConfigInterface {
  correct_threshold: number;
  performance_bands: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  type_difficulty_thresholds?: AccuracyThresholdMatrix;
  qroc?: {
    treat_blank_as_unanswered?: boolean;
    blank_response_feedback?: string;
  };
}
