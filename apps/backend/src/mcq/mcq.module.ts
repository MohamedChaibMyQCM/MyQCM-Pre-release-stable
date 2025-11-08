import { Module, forwardRef } from "@nestjs/common";
import { McqService } from "./mcq.service";
import { McqController } from "./mcq.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Mcq } from "./entities/mcq.entity";
import { OptionModule } from "src/option/option.module";
import { WalletModule } from "src/wallet/wallet.module";
import { TransactionModule } from "src/transaction/transaction.module";
import { RedisModule } from "src/redis/redis.module";
import { AssistantModule } from "src/assistant/assistant.module";
import { ProgressModule } from "src/progress/progress.module";
import { UserModule } from "src/user/user.module";
import { AdaptiveEngineModule } from "src/adaptive-engine/adaptive-engine.module";
import { KnowledgeComponentModule } from "src/knowledge-component/knowledge-component.module";
import { McqEnrichmentService } from "./mcq-enrichment.service";
import { KcSuggestionModule } from "src/kc-suggestion/kc-suggestion.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Mcq]),
    OptionModule,
    WalletModule,
    TransactionModule,
    RedisModule,
    AssistantModule,
    ProgressModule,
    forwardRef(() => UserModule),
    AdaptiveEngineModule,
    KnowledgeComponentModule,
    forwardRef(() => KcSuggestionModule),
  ],
  controllers: [McqController],
  providers: [McqService, McqEnrichmentService],
  exports: [McqService, McqEnrichmentService],
})
export class McqModule {}
