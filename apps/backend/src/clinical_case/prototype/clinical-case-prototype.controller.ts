import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ClinicalCasePrototypeService } from "./clinical-case-prototype.service";
import {
  PrototypeClinicalCaseDto,
  PrototypeClinicalCaseSubmissionResult,
} from "./clinical-case-prototype.dto";
import { PrototypeClinicalCaseSubmitDto } from "./clinical-case-prototype-submit.dto";

@Controller("prototype/clinical-case")
export class ClinicalCasePrototypeController {
  constructor(
    private readonly clinicalCasePrototypeService: ClinicalCasePrototypeService,
  ) {}

  @Get(":caseId")
  async getPrototype(
    @Param("caseId") caseId: string,
  ): Promise<PrototypeClinicalCaseDto> {
    return this.clinicalCasePrototypeService.getPrototype(caseId);
  }

  @Post(":caseId/submit")
  async submitAnswer(
    @Param("caseId") caseId: string,
    @Body() payload: PrototypeClinicalCaseSubmitDto,
  ): Promise<PrototypeClinicalCaseSubmissionResult> {
    return this.clinicalCasePrototypeService.submit(caseId, payload);
  }
}
