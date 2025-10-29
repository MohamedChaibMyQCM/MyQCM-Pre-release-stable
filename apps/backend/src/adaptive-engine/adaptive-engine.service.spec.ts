import { McqDifficulty, McqType } from "src/mcq/dto/mcq.type";
import { AdaptiveEngineService } from "./adaptive-engine.service";

const mockAdaptiveLearner = () => ({
  id: "learner-1",
  mastery: 0.2,
  ability: 0.4,
  course: {
    id: "course-1",
    guessing_probability: 0.2,
    slipping_probability: 0.1,
    learning_rate: 0.3,
  },
});

describe("AdaptiveEngineService", () => {
  let service: AdaptiveEngineService;
  let repository: any;

  beforeEach(() => {
    repository = {
      findOne: jest.fn().mockImplementation(() => Promise.resolve(mockAdaptiveLearner())),
      save: jest.fn().mockImplementation(async (learner) => learner),
      create: jest.fn(),
    };

    service = new AdaptiveEngineService(repository);
  });

  it("persists mastery updates and increases ability on correct answers", async () => {
    const payload = {
      is_correct: true,
      success_ratio: 1,
      type: McqType.qcm,
      difficulty: McqDifficulty.medium,
      estimated_time: 60,
      time_spent: 45,
      baseline: 1,
    };

    await service.updateAdaptiveLearner(
      { userId: "user-1", courseId: "course-1" },
      payload,
    );

    expect(repository.findOne).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledTimes(1);
    const saved = repository.save.mock.calls[0][0];
    expect(saved.mastery).toBeGreaterThan(0.2);
    expect(saved.mastery).toBeLessThanOrEqual(1);
    expect(saved.ability).toBeGreaterThanOrEqual(0.4);
    expect(saved.ability).toBeLessThanOrEqual(1);
  });

  it("reduces ability when the learner answers incorrectly", async () => {
    const learner = mockAdaptiveLearner();
    repository.findOne.mockResolvedValueOnce(learner);

    await service.updateAdaptiveLearner(
      { userId: "user-2", courseId: "course-1" },
      {
        is_correct: false,
        success_ratio: 0,
        type: McqType.qcm,
        difficulty: McqDifficulty.medium,
        estimated_time: 60,
        time_spent: 30,
        baseline: 1,
      },
    );

    const saved = repository.save.mock.calls[0][0];
    expect(saved.mastery).toBeLessThanOrEqual(0.2);
    expect(saved.mastery).toBeGreaterThanOrEqual(0);
    expect(saved.ability).toBeLessThanOrEqual(0.4);
    expect(saved.ability).toBeGreaterThanOrEqual(0);
  });
});
