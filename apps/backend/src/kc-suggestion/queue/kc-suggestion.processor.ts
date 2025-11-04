import { Process, Processor } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { KcSuggestionService } from "../services/kc-suggestion.service";
import { z } from "zod";

const BulkJobSchema = z.object({
  courseId: z.string().uuid(),
  mcqIds: z.array(z.string().uuid()).min(1),
  initiatedBy: z
    .object({
      userId: z.string().uuid().optional(),
      email: z.string().optional(),
      name: z.string().optional(),
    })
    .optional(),
});

type BulkJobPayload = z.infer<typeof BulkJobSchema>;

@Injectable()
@Processor("kc-suggestion")
export class KcSuggestionQueueProcessor {
  private readonly logger = new Logger(KcSuggestionQueueProcessor.name);

  constructor(private readonly suggestionService: KcSuggestionService) {}

  @Process("bulk-course")
  async handleBulkCourse(job: Job<BulkJobPayload>) {
    const payload = BulkJobSchema.parse(job.data);
    this.logger.debug(
      `Processing KC suggestion job ${job.id} for course ${payload.courseId} with ${payload.mcqIds.length} MCQs`,
    );
    await this.suggestionService.processBulkJob(payload, job.id as string);
  }
}
