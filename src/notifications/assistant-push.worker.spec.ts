jest.mock("src/mcq/mcq.service", () => ({ McqService: jest.fn() }));

import { AssistantPushWorker } from "./assistant-push.worker";
import { NotificationsGateway } from "./notifications.gateway";

interface McqService {
  findOneMcq: (params: { mcqId: string }) => Promise<any>;
}

class FakeQueue {
  constructor(private readonly handler: (job: any) => Promise<void>) {}

  async add(name: string, data: any) {
    await this.handler({ name, data });
  }
}

describe("AssistantPushWorker", () => {
  it("emits mcq to session room", async () => {
    const mcqService: McqService = {
      findOneMcq: jest.fn().mockResolvedValue({ id: "mcq1" }),
    };
    const emit = jest.fn();
    const to = jest.fn().mockReturnValue({ emit });
    const gateway: Partial<NotificationsGateway> = {
      server: { to } as any,
    };
    const workerInstance = new AssistantPushWorker(
      mcqService as any,
      gateway as NotificationsGateway,
    );

    const queue = new FakeQueue((job) => workerInstance.handle(job));
    await queue.add("assistant-push", {
      userId: "user1",
      sessionId: "session1",
      mcqId: "mcq1",
    });

    expect(mcqService.findOneMcq).toHaveBeenCalledWith({ mcqId: "mcq1" });
    expect(to).toHaveBeenCalledWith("session:session1");
    expect(emit).toHaveBeenCalledWith("assistant-push", { mcqId: "mcq1" });
  });
});
