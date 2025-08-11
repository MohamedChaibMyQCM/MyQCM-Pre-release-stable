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

const baseDeps = () => {
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
  const adaptiveEngineService = {
    getAdaptiveLearner: jest.fn().mockResolvedValue({ ability: 0.5, mastery: 0.8 }),
  } as any;
  const redisService = {} as any;
  const emailQueue = {} as any;
  const notificationQueue = {} as any;
  return {
    trainingSessionRepository,
    progressService,
    adaptiveEngineService,
    redisService,
    emailQueue,
    notificationQueue,
  };
};

describe('TrainingSessionService', () => {
  it('assistant mode with non-empty selection sets assistantNext to primary', async () => {
    const deps = baseDeps();
    const mcq = { id: 'mcq1', options: [] };
    const mcqService = {
      findMcqsPaginated: jest
        .fn()
        .mockResolvedValue({ data: [mcq], total: 1, page: 1, offset: 1 }),
      findFallbackMcq: jest.fn(),
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

    const service = new TrainingSessionService(
      deps.trainingSessionRepository,
      deps.emailQueue,
      deps.notificationQueue,
      {} as any,
      userProfileService,
      deps.progressService,
      mcqService,
      deps.redisService,
      deps.adaptiveEngineService,
    );

    const result = await service.getSessionMcqs('user1', 'session1');
    expect(result.assistantNext).toEqual(mcq);
    expect(mcqService.findFallbackMcq).not.toHaveBeenCalled();
  });

  it('assistant mode with empty selection uses fallback', async () => {
    const deps = baseDeps();
    const fallback = { id: 'fb1' };
    const mcqService = {
      findMcqsPaginated: jest
        .fn()
        .mockResolvedValue({ data: [], total: 0, page: 1, offset: 1 }),
      findFallbackMcq: jest.fn().mockResolvedValue(fallback),
    } as any;
    const userProfileService = {
      getAuthenticatedUserProfileById: jest.fn().mockResolvedValue({
        mode: { include_qcm_definer: ModeDefiner.ASSISTANT },
      }),
    } as any;

    const service = new TrainingSessionService(
      deps.trainingSessionRepository,
      deps.emailQueue,
      deps.notificationQueue,
      {} as any,
      userProfileService,
      deps.progressService,
      mcqService,
      deps.redisService,
      deps.adaptiveEngineService,
    );

    const result = await service.getSessionMcqs('user1', 'session1');
    expect(mcqService.findFallbackMcq).toHaveBeenCalledTimes(1);
    expect(result.assistantNext).toEqual(fallback);
  });

  it('non-assistant mode does not set assistantNext', async () => {
    const deps = baseDeps();
    const mcq = { id: 'mcq1', options: [] };
    const mcqService = {
      findMcqsPaginated: jest
        .fn()
        .mockResolvedValue({ data: [mcq], total: 1, page: 1, offset: 1 }),
      findFallbackMcq: jest.fn(),
    } as any;
    const userProfileService = {
      getAuthenticatedUserProfileById: jest.fn().mockResolvedValue({
        mode: {
          include_qcm_definer: ModeDefiner.USER,
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

    const service = new TrainingSessionService(
      deps.trainingSessionRepository,
      deps.emailQueue,
      deps.notificationQueue,
      {} as any,
      userProfileService,
      deps.progressService,
      mcqService,
      deps.redisService,
      deps.adaptiveEngineService,
    );

    const result = await service.getSessionMcqs('user1', 'session1');
    expect(result.assistantNext).toBeUndefined();
    expect(mcqService.findFallbackMcq).not.toHaveBeenCalled();
  });
});
