import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ClinicalCaseFeedbackService } from "./clinical_case-feedback.service";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { Roles } from "common/decorators/auth/roles.decorator";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";
import { CreateClinicalCaseFeedbackDto } from "./dto/create-clinical_case-feedback.dto";

@Controller("/clinical-case/feedback")
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles()
export class ClinicalCaseFeedbackController {
  constructor(
    private readonly clinicalCaseFeedbackService: ClinicalCaseFeedbackService,
  ) {}

  @Post()
  async upsertFeedback(
    @GetUser() user: JwtPayload,
    @Body() payload: CreateClinicalCaseFeedbackDto,
  ) {
    const data = await this.clinicalCaseFeedbackService.upsertFeedback(
      user.id,
      payload,
    );

    return {
      message: "Feedback enregistré avec succès",
      status: HttpStatus.CREATED,
      data,
    };
  }

  @Get(":caseIdentifier/me")
  async getMyFeedback(
    @GetUser() user: JwtPayload,
    @Param("caseIdentifier") caseIdentifier: string,
  ) {
    const data = await this.clinicalCaseFeedbackService.getUserFeedback(
      user.id,
      caseIdentifier,
    );

    return {
      message: "Feedback utilisateur récupéré avec succès",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get(":caseIdentifier/summary")
  async getSummary(
    @Param("caseIdentifier") caseIdentifier: string,
    @Query("limit") limit?: string,
  ) {
    const parsedLimit = Number.isInteger(Number(limit))
      ? Math.max(1, Math.min(parseInt(limit as string, 10), 20))
      : 5;

    const data = await this.clinicalCaseFeedbackService.getSummary(
      caseIdentifier,
      { includeRecent: parsedLimit },
    );

    return {
      message: "Résumé des avis cliniques récupéré avec succès",
      status: HttpStatus.OK,
      data,
    };
  }
}
