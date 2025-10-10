import { Module } from "@nestjs/common";
import { ClinicalCaseService } from "./clinical_case.service";
import { ClinicalCaseController } from "./clinical_case.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { McqModule } from "src/mcq/mcq.module";
import { ClinicalCase } from "./entities/clinical_case.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ClinicalCase]), McqModule],
  controllers: [ClinicalCaseController],
  providers: [ClinicalCaseService],
})
export class ClinicalCaseModule {}
