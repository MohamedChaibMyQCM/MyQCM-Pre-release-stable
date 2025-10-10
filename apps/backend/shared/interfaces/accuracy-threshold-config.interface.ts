export interface AccuracyThresholdConfigInterface {
  correct_threshold: number;
  performance_bands: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
}
