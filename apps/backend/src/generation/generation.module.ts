import { Module } from "@nestjs/common";
import { GenerationService } from "./generation.service";
import { GenerationController } from "./generation.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GenerationRequest } from "./entities/generation-request.entity";
import { GenerationItem } from "./entities/generation-item.entity";
import { Unit } from "src/unit/entities/unit.entity";
import { Subject } from "src/subject/entities/subject.entity";
import { Course } from "src/course/entities/course.entity";
import { McqModule } from "src/mcq/mcq.module";
import { HttpModule } from "@nestjs/axios";
import { GenerationAiService } from "./generation-ai.service";

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      GenerationRequest,
      GenerationItem,
      Unit,
      Subject,
      Course,
    ]),
    McqModule,
  ],
  providers: [GenerationService, GenerationAiService],
  controllers: [GenerationController],
  exports: [GenerationService],
})
export class GenerationModule {}
