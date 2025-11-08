import { forwardRef, Module } from "@nestjs/common";
import { CourseController } from "./course.controller";
import { Course } from "./entities/course.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CourseService } from "./course.service";
import { SubjectModule } from "src/subject/subject.module";
import { ProgressModule } from "src/progress/progress.module";
import { McqModule } from "src/mcq/mcq.module";
import { CacheModule } from "@nestjs/cache-manager";

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
    ProgressModule,
    forwardRef(() => McqModule),
  ],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}
