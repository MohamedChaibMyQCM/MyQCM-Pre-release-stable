import { AccuracyThresholdConfigInterface } from "shared/interfaces/accuracy-threshold-config.interface";

export const DefaultAccuracyThresholdConfig: AccuracyThresholdConfigInterface =
  {
    correct_threshold: 0.7, // 70% or above is scorrect
    performance_bands: {
      excellent: 0.85, // 85% or above
      good: 0.7, // 70-84%
      fair: 0.5, // 50-69%
      poor: 0.5, // Below 50%
    },
  };
