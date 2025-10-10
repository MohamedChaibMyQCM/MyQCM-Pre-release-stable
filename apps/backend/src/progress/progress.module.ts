import { Module } from "@nestjs/common";
import { ProgressService } from "./progress.service";
import { ProgressController } from "./progress.controller";
import { Progress } from "./entities/progress.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RedisModule } from "src/redis/redis.module";

@Module({
  imports: [TypeOrmModule.forFeature([Progress]), RedisModule],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
