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
import { makeCounterProvider } from "@willsoto/nestjs-prometheus";

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
  providers: [
    TrainingSessionService,
    makeCounterProvider({
      name: "session_mcq_cache_hits_total",
      help: "Counts cache hits for training session MCQ selection",
      labelNames: ["difficulty"],
    }),
    makeCounterProvider({
      name: "session_mcq_cache_misses_total",
      help: "Counts cache misses for training session MCQ selection",
      labelNames: ["difficulty"],
    }),
  ],
})
export class TrainingSessionModule {}
