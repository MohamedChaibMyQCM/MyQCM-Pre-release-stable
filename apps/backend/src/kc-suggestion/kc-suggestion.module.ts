import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BullModule } from "@nestjs/bull";
import { makeCounterProvider } from "@willsoto/nestjs-prometheus";
import { KcSuggestionController } from "./kc-suggestion.controller";
import { KcPromptBuilderService } from "./services/kc-prompt-builder.service";
import { KcSuggestionLlmService } from "./services/kc-suggestion-llm.service";
import { KcSuggestionService } from "./services/kc-suggestion.service";
import { KnowledgeComponentSuggestionCall } from "./entities/kc-suggestion-call.entity";
import { KnowledgeComponentModule } from "src/knowledge-component/knowledge-component.module";
import { CourseModule } from "src/course/course.module";
import { McqModule } from "src/mcq/mcq.module";
import { KcSuggestionQueueProcessor } from "./queue/kc-suggestion.processor";
import { KnowledgeComponentSuggestionMetricsService } from "./services/kc-suggestion-metrics.service";
import { Mcq } from "src/mcq/entities/mcq.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([KnowledgeComponentSuggestionCall, Mcq]),
    BullModule.registerQueue({
      name: "kc-suggestion",
    }),
    KnowledgeComponentModule,
    CourseModule,
    forwardRef(() => McqModule),
  ],
  controllers: [KcSuggestionController],
  providers: [
    KcPromptBuilderService,
    KcSuggestionLlmService,
    KcSuggestionService,
    KcSuggestionQueueProcessor,
    KnowledgeComponentSuggestionMetricsService,
    makeCounterProvider({
      name: "kc_suggestion_calls_total",
      help: "Total number of KC suggestion invocations",
      labelNames: ["model", "course_id"],
    }),
    makeCounterProvider({
      name: "kc_suggestion_prompt_tokens_total",
      help: "Total prompt tokens consumed by KC suggestions",
      labelNames: ["model", "course_id"],
    }),
    makeCounterProvider({
      name: "kc_suggestion_completion_tokens_total",
      help: "Total completion tokens consumed by KC suggestions",
      labelNames: ["model", "course_id"],
    }),
    makeCounterProvider({
      name: "kc_suggestion_total_tokens",
      help: "Total tokens (prompt + completion) consumed by KC suggestions",
      labelNames: ["model", "course_id"],
    }),
  ],
  exports: [KcSuggestionService],
})
export class KcSuggestionModule {}
