import { ModeDefiner } from '../mode/types/enums/mode-definier.enum';
import { TrainingSessionStatus } from './types/enums/training-session.enum';

import { TrainingSessionService } from './training-session.service';

jest.mock('src/user/entities/user.entity', () => ({}), { virtual: true });
jest.mock('src/user/services/user.service', () => ({}), { virtual: true });
jest.mock('src/user/services/user-profile.service', () => ({}), { virtual: true });
jest.mock('src/progress/progress.service', () => ({}), { virtual: true });
jest.mock('src/mcq/mcq.service', () => ({}), { virtual: true });
jest.mock('src/redis/redis.service', () => ({}), { virtual: true });
jest.mock('src/adaptive-engine/adaptive-engine.service', () => ({}), { virtual: true });

describe('TrainingSessionService', () => {
  it('publishes assistant-push job when assistant mode active', async () => {
    const notificationQueue = { add: jest.fn() } as any;
    const trainingSessionRepository = {
      findOne: jest.fn().mockResolvedValue({
        id: 'session1',
        status: TrainingSessionStatus.IN_PROGRESS,
        course: { id: 'course1' },
        number_of_questions: 10,
      }),
    } as any;
    const progressService = {
      findProgress: jest.fn().mockResolvedValue([]),
    } as any;
    const mcqService = {
      findMcqsPaginated: jest
        .fn()
        .mockResolvedValue({ data: [{ id: 'mcq1', options: [] }], total: 1, page: 1, offset: 1 }),
    } as any;
    const userProfileService = {
      getAuthenticatedUserProfileById: jest.fn().mockResolvedValue({
        mode: {
          include_qcm_definer: ModeDefiner.ASSISTANT,
          include_qcs_definer: ModeDefiner.USER,
          include_qroc_definer: ModeDefiner.USER,
          time_limit_definer: ModeDefiner.USER,
          number_of_questions_definer: ModeDefiner.USER,
          randomize_questions_order_definer: ModeDefiner.USER,
          randomize_options_order_definer: ModeDefiner.USER,
          difficulty_definer: ModeDefiner.USER,
        },
      }),
    } as any;
    const adaptiveEngineService = {
      getAdaptiveLearner: jest.fn().mockResolvedValue({ ability: 0.5, mastery: 0.8 }),
    } as any;

    const service = new TrainingSessionService(
      trainingSessionRepository,
      {} as any,
      notificationQueue,
      {} as any,
      userProfileService,
      progressService,
      mcqService,
      {} as any,
      adaptiveEngineService,
    );

    await service.getSessionMcqs('user1', 'session1');

    expect(notificationQueue.add).toHaveBeenCalledWith('assistant-push', {
      userId: 'user1',
      sessionId: 'session1',
      mcqId: 'mcq1',
    });
  });
});
