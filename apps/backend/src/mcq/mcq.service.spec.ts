import { McqService } from "./mcq.service";
import { McqDifficulty, McqType } from "./dto/mcq.type";
import { DefaultAccuracyThresholdConfig } from "config/default-accuracy-threshold.config";

describe("McqService.evaluateAttemptAccuracy", () => {
  let service: McqService;
  const redisService = {
    get: jest.fn(),
  };

  beforeEach(() => {
    redisService.get.mockResolvedValue({
      ...DefaultAccuracyThresholdConfig,
      type_difficulty_thresholds: {
        [McqType.qcm]: {
          [McqDifficulty.medium]: 0.4,
        },
        [McqType.qroc]: {
          [McqDifficulty.medium]: 0.8,
        },
      },
      qroc: {
        treat_blank_as_unanswered: true,
        blank_response_feedback: "Réponse manquante.",
      },
    });

    service = new McqService(
      {} as any,
      redisService as any,
      {} as any,
      {} as any,
      {} as any,
      { getAssistantResponseRatingAndFeedback: jest.fn() } as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );
  });

  it("marks QCM attempt correct when rating meets the configured threshold", async () => {
    const mcq = {
      type: McqType.qcm,
      difficulty: McqDifficulty.medium,
      options: [
        { id: "a", is_correct: true },
        { id: "b", is_correct: true },
        { id: "c", is_correct: false },
        { id: "d", is_correct: false },
      ],
    } as any;

    const dto = {
      response_options: [{ option: "a" }],
    } as any;

    const result = await (service as any).evaluateAttemptAccuracy(dto, mcq);

    expect(result.rating).toBeGreaterThanOrEqual(0);
    expect(result.isCorrect).toBe(true);
  });

  it("returns null rating for blank QROC responses when configured to skip", async () => {
    const mcq = {
      type: McqType.qroc,
      difficulty: McqDifficulty.medium,
      answer: "Paris",
    } as any;

    const dto = {
      response: "   ",
    } as any;

    const result = await (service as any).evaluateAttemptAccuracy(dto, mcq);

    expect(result.rating).toBeNull();
    expect(result.isCorrect).toBe(false);
    expect(result.feedback).toBe("Réponse manquante.");
  });
});
