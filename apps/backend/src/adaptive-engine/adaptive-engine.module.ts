import { Module } from "@nestjs/common";
import { AdaptiveEngineService } from "./adaptive-engine.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RedisModule } from "src/redis/redis.module";
import { AdaptiveLearner } from "./entities/adaptive-learner.entity";

@Module({
  imports: [TypeOrmModule.forFeature([AdaptiveLearner]), RedisModule],
  providers: [AdaptiveEngineService],
  exports: [AdaptiveEngineService],
})
export class AdaptiveEngineModule {}
