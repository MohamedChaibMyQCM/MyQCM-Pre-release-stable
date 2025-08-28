import { Processor, Process } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { McqService } from "src/mcq/mcq.service";
import { NotificationsGateway } from "./notifications.gateway";

interface AssistantPushPayload {
  userId: string;
  sessionId: string;
  mcqId: string;
}

@Injectable()
@Processor("notification-queue")
export class AssistantPushWorker {
  private readonly logger = new Logger(AssistantPushWorker.name);

  constructor(
    private readonly mcqService: McqService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  @Process("assistant-push")
  async handle(job: Job<AssistantPushPayload>) {
    const { userId, sessionId, mcqId } = job.data;
    if (!userId || !sessionId || !mcqId) {
      this.logger.error("assistant-push missing fields");
      return;
    }

    const mcq = await this.mcqService.findOneMcq({ mcqId });
    if (!mcq) {
      this.logger.error(`MCQ not found: ${mcqId}`);
      return;
    }

    this.notificationsGateway.server
      .to(`session:${sessionId}`)
      .emit("assistant-push", { mcqId });

    this.logger.log(
      `ASSISTANT_PUSH user:${userId} session:${sessionId} mcq:${mcqId}`,
    );
  }
}
