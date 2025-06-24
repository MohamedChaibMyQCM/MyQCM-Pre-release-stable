import { Module } from "@nestjs/common";
import { FacultyService } from "./faculty.service";
import { FacultyController } from "./faculty.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Faculty } from "./entities/faculty.entity";
import { UniversityModule } from "src/university/university.module";

@Module({
  imports: [TypeOrmModule.forFeature([Faculty]), UniversityModule],
  controllers: [FacultyController],
  providers: [FacultyService],
  exports: [FacultyService],
})
export class FacultyModule {}
