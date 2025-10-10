import { Module } from "@nestjs/common";
import { SubjectService } from "./subject.service";
import { SubjectController } from "./subject.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Subject } from "./entities/subject.entity";
import { UnitModule } from "src/unit/unit.module";
import { UserModule } from "src/user/user.module";
import { ProgressModule } from "src/progress/progress.module";
import { McqModule } from "src/mcq/mcq.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Subject]),
    UnitModule,
    UserModule,
    ProgressModule,
    McqModule,
  ],
  controllers: [SubjectController],
  providers: [SubjectService],
  exports: [SubjectService],
})
export class SubjectModule {}
