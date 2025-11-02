import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { KnowledgeComponent } from "./entities/knowledge-component.entity";
import { KnowledgeDomain } from "./entities/knowledge-domain.entity";
import { KnowledgeComponentService } from "./knowledge-component.service";
import { KnowledgeComponentController } from "./knowledge-component.controller";
import { Course } from "src/course/entities/course.entity";

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeDomain, KnowledgeComponent, Course])],
  controllers: [KnowledgeComponentController],
  providers: [KnowledgeComponentService],
  exports: [KnowledgeComponentService],
})
export class KnowledgeComponentModule {}
