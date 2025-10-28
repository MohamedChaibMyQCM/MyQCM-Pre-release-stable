import { Module } from "@nestjs/common";
import { ClinicalCaseService } from "./clinical_case.service";
import { ClinicalCaseController } from "./clinical_case.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { McqModule } from "src/mcq/mcq.module";
import { ClinicalCase } from "./entities/clinical_case.entity";
import { ClinicalCasePrototypeController } from "./prototype/clinical-case-prototype.controller";
import { ClinicalCasePrototypeService } from "./prototype/clinical-case-prototype.service";
import { Mcq } from "src/mcq/entities/mcq.entity";
import { Option } from "src/option/entities/option.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ClinicalCase, Mcq, Option]), McqModule],
  controllers: [ClinicalCaseController, ClinicalCasePrototypeController],
  providers: [ClinicalCaseService, ClinicalCasePrototypeService],
})
export class ClinicalCaseModule {}
