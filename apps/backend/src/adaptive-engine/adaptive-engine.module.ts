import { Module } from "@nestjs/common";
import { AdaptiveEngineService } from "./adaptive-engine.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdaptiveLearner } from "./entities/adaptive-learner.entity";
import { ItemIrtParams } from "./entities/item-irt-params.entity";
import { AdaptiveLearnerKnowledgeComponent } from "./entities/adaptive-learner-knowledge-component.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdaptiveLearner,
      ItemIrtParams,
      AdaptiveLearnerKnowledgeComponent,
    ]),
  ],
  providers: [AdaptiveEngineService],
  exports: [AdaptiveEngineService],
})
export class AdaptiveEngineModule {}
