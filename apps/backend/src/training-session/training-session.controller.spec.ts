import { TrainingSessionController } from './training-session.controller';
import { TrainingSessionService } from './training-session.service';

jest.mock('src/user/entities/user.entity', () => ({}), { virtual: true });
jest.mock('src/user/services/user.service', () => ({}), { virtual: true });
jest.mock('src/user/services/user-profile.service', () => ({}), { virtual: true });
jest.mock('src/progress/progress.service', () => ({}), { virtual: true });
jest.mock('src/mcq/mcq.service', () => ({}), { virtual: true });
jest.mock('src/redis/redis.service', () => ({}), { virtual: true });
jest.mock('src/adaptive-engine/adaptive-engine.service', () => ({}), { virtual: true });

describe('TrainingSessionController', () => {
  it('returns assistantNext from service', async () => {
    const service = {
      getSessionMcqs: jest.fn().mockResolvedValue({ assistantNext: { id: 'mcq1' }, data: [] }),
    } as unknown as TrainingSessionService;
    const controller = new TrainingSessionController(service);
    const result = await controller.getSessionMcqsToSolve('session1', { id: 'user1' } as any);
    expect(result.data.assistantNext).toEqual({ id: 'mcq1' });
  });
});
