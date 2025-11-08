import { AccuracyThresholdConfigInterface } from "shared/interfaces/accuracy-threshold-config.interface";
import { McqType, McqDifficulty } from "src/mcq/dto/mcq.type";

export const DefaultAccuracyThresholdConfig: AccuracyThresholdConfigInterface = {
  correct_threshold: 0.7, // Global safety net
  performance_bands: {
    excellent: 0.85, // 85% or above
    good: 0.7, // 70-84%
    fair: 0.5, // 50-69%
    poor: 0.5, // Below 50%
  },
  type_difficulty_thresholds: {
    [McqType.qcm]: {
      [McqDifficulty.easy]: 0.75,
      [McqDifficulty.medium]: 0.8,
      [McqDifficulty.hard]: 0.85,
    },
    [McqType.qcs]: {
      [McqDifficulty.easy]: 0.8,
      [McqDifficulty.medium]: 0.85,
      [McqDifficulty.hard]: 0.9,
    },
    [McqType.qroc]: {
      default: 0.85,
      [McqDifficulty.easy]: 0.75,
      [McqDifficulty.medium]: 0.8,
      [McqDifficulty.hard]: 0.85,
    },
  },
  qroc: {
    treat_blank_as_unanswered: true,
    blank_response_feedback:
      "Veuillez fournir une réponse pour que nous puissions l'évaluer.",
  },
};
