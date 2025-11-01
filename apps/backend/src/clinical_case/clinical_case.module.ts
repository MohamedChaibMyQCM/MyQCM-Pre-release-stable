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
import { ClinicalCaseFeedback } from "./entities/clinical_case_feedback.entity";
import { ClinicalCaseFeedbackService } from "./clinical_case-feedback.service";
import { ClinicalCaseFeedbackController } from "./clinical_case-feedback.controller";
import { UserModule } from "src/user/user.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([ClinicalCase, ClinicalCaseFeedback, Mcq, Option]),
    UserModule,
    McqModule,
  ],
  controllers: [
    ClinicalCaseController,
    ClinicalCasePrototypeController,
    ClinicalCaseFeedbackController,
  ],
  providers: [
    ClinicalCaseService,
    ClinicalCasePrototypeService,
    ClinicalCaseFeedbackService,
  ],
})
export class ClinicalCaseModule {}
