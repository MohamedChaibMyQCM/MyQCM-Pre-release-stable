import { AccuracyThresholdConfigInterface } from "shared/interfaces/accuracy-threshold-config.interface";
import { McqDifficulty, McqType } from "../dto/mcq.type";

const DEFAULT_QROC_BLANK_FEEDBACK =
  "Veuillez fournir une réponse afin que nous puissions l'évaluer.";

export function resolveAccuracyThreshold(
  config: AccuracyThresholdConfigInterface,
  type?: McqType | null,
  difficulty?: McqDifficulty | null,
): number {
  const matrix = config.type_difficulty_thresholds ?? {};
  const typeKey = type ?? "";
  const difficultyKey = difficulty ?? "";

  const typeThresholds = matrix[typeKey as keyof typeof matrix];
  if (typeThresholds) {
    const difficultyThreshold =
      typeThresholds[difficultyKey as keyof typeof typeThresholds];
    const fallback = typeThresholds.default;
    const resolved =
      typeof difficultyThreshold === "number"
        ? difficultyThreshold
        : typeof fallback === "number"
        ? fallback
        : config.correct_threshold;
    return resolved;
  }

  return config.correct_threshold;
}

export function shouldTreatBlankQrocAsUnanswered(
  config: AccuracyThresholdConfigInterface,
): boolean {
  return config.qroc?.treat_blank_as_unanswered !== false;
}

export function qrocBlankFeedback(
  config: AccuracyThresholdConfigInterface,
): string {
  return (
    config.qroc?.blank_response_feedback ?? DEFAULT_QROC_BLANK_FEEDBACK
  );
}
