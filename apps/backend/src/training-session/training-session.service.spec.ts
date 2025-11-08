import { ModeDefiner } from '../mode/types/enums/mode-definier.enum';
import { TrainingSessionStatus } from './types/enums/training-session.enum';
import { McqDifficulty } from 'src/mcq/dto/mcq.type';
import { TrainingSessionService } from './training-session.service';
import { RedisKeys } from 'common/utils/redis-keys.util';

jest.mock('src/user/entities/user.entity', () => ({}), { virtual: true });
jest.mock('src/user/services/user.service', () => ({}), { virtual: true });
jest.mock('src/user/services/user-profile.service', () => ({}), { virtual: true });
jest.mock('src/progress/progress.service', () => ({}), { virtual: true });
jest.mock('src/mcq/mcq.service', () => ({}), { virtual: true });
jest.mock('src/redis/redis.service', () => ({}), { virtual: true });
jest.mock('src/adaptive-engine/adaptive-engine.service', () => ({}), { virtual: true });

const baseDeps = () => {
  const redisStore = new Map<string, string>();
  const redisService = {
    get: jest.fn(async (key: string, parse: boolean = false) => {
      const raw = redisStore.get(key) ?? null;
      if (raw === null) return null;
      return parse ? JSON.parse(raw) : raw;
    }),
    set: jest.fn(async (key: string, value: any, ttl?: number, stringify: boolean = typeof value !== 'string') => {
      const payload = stringify ? JSON.stringify(value) : value;
      redisStore.set(key, payload);
      return 'OK';
    }),
    increment: jest.fn(async (key: string) => {
      const next = (Number(redisStore.get(key) ?? '0') || 0) + 1;
      redisStore.set(key, String(next));
      return next;
    }),
  } as any;
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
  const emailQueue = {} as any;
  const notificationQueue = {} as any;
  return {
    trainingSessionRepository,
    progressService,
    adaptiveEngineService,
    redisService,
    emailQueue,
    notificationQueue,
    redisStore,
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
      undefined,
      undefined,
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
      undefined,
      undefined,
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
      undefined,
      undefined,
    );

    const result = await service.getSessionMcqs('user1', 'session1');
    expect(result.assistantNext).toBeUndefined();
    expect(mcqService.findFallbackMcq).not.toHaveBeenCalled();
  });

  it('uses ability-derived difficulty and flags fallback when inventory empty', async () => {
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
      getAdaptiveLearner: jest.fn().mockResolvedValue({
        ability: 0.1,
        mastery: 0.2,
      }),
    } as any;
    const mcq = { id: 'mcq42', options: [] };
    const mcqService = {
      findMcqsPaginated: jest
        .fn()
        .mockResolvedValueOnce({ data: [], total: 0, page: 1, offset: 1 })
        .mockResolvedValueOnce({ data: [mcq], total: 1, page: 1, offset: 1 }),
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
    const redisStore = new Map<string, string>();
    const redisService = {
      get: jest.fn(async (key: string, parse: boolean = false) => {
        const raw = redisStore.get(key) ?? null;
        if (raw === null) return null;
        return parse ? JSON.parse(raw) : raw;
      }),
      set: jest.fn(async (key: string, value: any, ttl?: number, stringify: boolean = typeof value !== 'string') => {
        const payload = stringify ? JSON.stringify(value) : value;
        redisStore.set(key, payload);
        return 'OK';
      }),
      increment: jest.fn(async (key: string) => {
        const next = (Number(redisStore.get(key) ?? '0') || 0) + 1;
        redisStore.set(key, String(next));
        return next;
      }),
    } as any;

    const service = new TrainingSessionService(
      trainingSessionRepository,
      {} as any,
      {} as any,
      {} as any,
      userProfileService,
      progressService,
      mcqService,
      redisService,
      adaptiveEngineService,
      undefined,
      undefined,
    );

    (service as any).defineTrainingSessionParams = jest
      .fn()
      .mockResolvedValue({});
    const warnSpy = jest
      .spyOn((service as any).logger, 'warn')
      .mockImplementation(() => undefined);
    jest
      .spyOn((service as any).logger, 'log')
      .mockImplementation(() => undefined);

    const result = await service.getSessionMcqs('user1', 'session1');

    expect(mcqService.findMcqsPaginated).toHaveBeenCalledTimes(2);
    expect(mcqService.findMcqsPaginated.mock.calls[0][0].difficulty).toEqual(
      McqDifficulty.medium,
    );
    expect(warnSpy).toHaveBeenCalledWith(
      'ADAPTIVE_DIFFICULTY_FALLBACK',
      expect.objectContaining({
        userId: 'user1',
        sessionId: 'session1',
        requestedDifficulty: McqDifficulty.medium,
      }),
    );
    expect(result.difficultyFallback).toBe(true);
    expect(result.assistantNext).toEqual(mcq);
  });

  it('reuses cached MCQ ids for identical requests', async () => {
    const deps = baseDeps();
    const mcq = { id: 'mcq-cache', options: [] };
    const mcqService = {
      findMcqsPaginated: jest.fn().mockResolvedValue({
        data: [mcq],
        total: 1,
        page: 1,
        offset: 1,
        total_pages: 1,
      }),
      getMcqsByIds: jest.fn().mockResolvedValue([mcq]),
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
      undefined,
      undefined,
    );

    (service as any).defineTrainingSessionParams = jest
      .fn()
      .mockResolvedValue({});

    await service.getSessionMcqs('user1', 'session1');
    await service.getSessionMcqs('user1', 'session1');

    expect(mcqService.findMcqsPaginated).toHaveBeenCalledTimes(1);
    expect(mcqService.getMcqsByIds).toHaveBeenCalledTimes(1);
  });

  it('invalidates the cache when the session attempt counter changes', async () => {
    const deps = baseDeps();
    const mcq = { id: 'mcq-cache', options: [] };
    const mcqService = {
      findMcqsPaginated: jest.fn().mockResolvedValue({
        data: [mcq],
        total: 1,
        page: 1,
        offset: 1,
        total_pages: 1,
      }),
      getMcqsByIds: jest.fn().mockResolvedValue([mcq]),
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
      undefined,
      undefined,
    );

    (service as any).defineTrainingSessionParams = jest
      .fn()
      .mockResolvedValue({});

    await service.getSessionMcqs('user1', 'session1');

    const counterKey = RedisKeys.getSessionAttemptCounter('session1');
    await deps.redisService.increment(counterKey);

    await service.getSessionMcqs('user1', 'session1');

    expect(mcqService.findMcqsPaginated).toHaveBeenCalledTimes(2);
    expect(mcqService.getMcqsByIds).not.toHaveBeenCalled();
  });
});
