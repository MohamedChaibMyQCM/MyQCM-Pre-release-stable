import { Module } from "@nestjs/common";
import { TrainingSessionService } from "./training-session.service";
import { TrainingSessionController } from "./training-session.controller";
import { TrainingSession } from "./entities/training-session.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QueueModule } from "src/redis/queue/queue.module";
import { UserModule } from "src/user/user.module";
import { AssistantModule } from "src/assistant/assistant.module";
import { ProgressModule } from "src/progress/progress.module";
import { McqModule } from "src/mcq/mcq.module";
import { RedisModule } from "src/redis/redis.module";
import { AdaptiveEngineModule } from "src/adaptive-engine/adaptive-engine.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([TrainingSession]),
    QueueModule,
    UserModule,
    AssistantModule,
    ProgressModule,
    McqModule,
    RedisModule,
    AdaptiveEngineModule,
  ],
  controllers: [TrainingSessionController],
  providers: [TrainingSessionService],
})
export class TrainingSessionModule {}
