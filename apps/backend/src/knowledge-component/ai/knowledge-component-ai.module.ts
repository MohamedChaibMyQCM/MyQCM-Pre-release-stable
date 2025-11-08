import { Module } from "@nestjs/common";
import { KnowledgeComponentModule } from "../knowledge-component.module";
import { McqModule } from "src/mcq/mcq.module";
import { KcSuggestionModule } from "src/kc-suggestion/kc-suggestion.module";
import { KnowledgeComponentAiController } from "./knowledge-component-ai.controller";
import { KnowledgeComponentAiService } from "./knowledge-component-ai.service";

@Module({
  imports: [
    KnowledgeComponentModule,
    McqModule,
    KcSuggestionModule,
  ],
  controllers: [KnowledgeComponentAiController],
  providers: [KnowledgeComponentAiService],
  exports: [KnowledgeComponentAiService],
})
export class KnowledgeComponentAiModule {}
