import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  Query,
  ForbiddenException,
} from "@nestjs/common";
import { ClinicalCaseService } from "./clinical_case.service";
import { CreateClinicalCaseDto } from "./dto/create-clinical_case.dto";
import { UpdateClinicalCaseDto } from "./dto/update-clinical_case.dto";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { Roles } from "common/decorators/auth/roles.decorator";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Freelancer } from "src/freelancer/entities/freelancer.entity";
import { CreateMcqInClinicalCase } from "src/mcq/dto/create-mcq.dto";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { UpdateMcqDto } from "src/mcq/dto/update-mcq.dto";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";
import { UserSubscriptionService } from "src/user/services/user-subscription.service";

@ApiTags("Clinical Case")
@Controller("clinical-case")
export class ClinicalCaseController {
  constructor(
    private readonly clinicalCaseService: ClinicalCaseService,
    private readonly userSubscriptionService: UserSubscriptionService,
  ) {}

  @Post()
  @ApiOperation({ summary: "create new clinical case" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER)
  async create(
    @Body() createClinicalCaseDto: CreateClinicalCaseDto,
    @GetUser() freelancer: Freelancer,
  ) {
    const createdCase = await this.clinicalCaseService.create(
      createClinicalCaseDto,
      freelancer,
    );
    return {
      message: "Clinical case was created successfully",
      status: HttpStatus.CREATED,
      data: {
        id: createdCase.id,
        title: createdCase.title,
      },
    };
  }

  @Post("/mcq/:clinicalCaseId")
  @ApiOperation({ summary: "add mcq to clincal case" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER)
  async addMcqToClinicalCase(
    @Body() createMcqInClinicalCaseDto: CreateMcqInClinicalCase,
    @Param("clinicalCaseId") clinicalCaseId: string,
    @GetUser() freelancer: Freelancer,
  ) {
    const data = await this.clinicalCaseService.addMcqToClinicalCase(
      createMcqInClinicalCaseDto,
      clinicalCaseId,
      freelancer,
    );
    return {
      message: `Mcq of type ${createMcqInClinicalCaseDto.type} cretaed succesfully`,
      status: HttpStatus.CREATED,
      data,
    };
  }

  @Get()
  @ApiOperation({ summary: "get all clinical cases (pagination)" })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "page", required: false })
  @UseGuards(AccessTokenGuard, RolesGuard)
  async findAll(@Query("limit") limit: number, @Query("page") page: number) {
    const parsedLimit = Number.isFinite(Number(limit)) ? Number(limit) : 20;
    const parsedPage = Number.isFinite(Number(page)) ? Number(page) : 1;
    const data = await this.clinicalCaseService.findAll(parsedPage, parsedLimit);
    return {
      meessage: "Clinical cases fetched succesfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get("catalog")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiOperation({
    summary: "Get catalog of clinical cases available for alpha users",
  })
  async getCatalog(
    @GetUser() user: JwtPayload,
    @Query("limit") limit: number,
    @Query("page") page: number,
  ) {
    const parsedLimit = Number.isFinite(Number(limit)) ? Number(limit) : 20;
    const parsedPage = Number.isFinite(Number(page)) ? Number(page) : 1;
    const subscription =
      await this.userSubscriptionService.findUserCurrentSubscription(user.id);

    if (!subscription?.plan?.is_alpha) {
      throw new ForbiddenException(
        "Votre abonnement ne donne pas accès aux fonctionnalités Labs.",
      );
    }

    const data = await this.clinicalCaseService.findAll(parsedPage, parsedLimit);
    return {
      message: "Catalogue clinique récupéré avec succès",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get("/freelancer")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER)
  @ApiOperation({
    summary: "find all mcq of freelancer",
  })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "type", required: false })
  async findAllByFreelancer(
    @GetUser() freelancer: Freelancer,
    @Query("limit") limit: number,
    @Query("page") page: number,
  ) {
    const data = await this.clinicalCaseService.getAllClinicalCaseByFreelancer(
      freelancer,
      page,
      limit,
    );
    return {
      message: "Mcqs fetched succesfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get(":clinicalCaseId/full")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER)
  @ApiOperation({ summary: "get clinical case with questions for editing" })
  async findOneFull(
    @Param("clinicalCaseId") clinicalCaseId: string,
    @GetUser() freelancer: Freelancer,
  ) {
    const data = await this.clinicalCaseService.findOneWithDetailsForFreelancer(
      clinicalCaseId,
      freelancer,
    );
    return {
      meessage: "Clinical case fetched succesfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get(":clinicalCaseId")
  @ApiOperation({ summary: "get one clinical case" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  async findOne(@Param("clinicalCaseId") clinicalCaseId: string) {
    const data = await this.clinicalCaseService.findOne(clinicalCaseId, true);
    return {
      meessage: "Clinical case fetched succesfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Patch(":clinicalCaseId")
  @ApiOperation({ summary: "update clinical case (not for realtions ) " })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER)
  async update(
    @Param("clinicalCaseId") clinicalCaseId: string,
    @Body() updateClinicalCaseDto: UpdateClinicalCaseDto,
    @GetUser() freelancer: Freelancer,
  ) {
    const data = await this.clinicalCaseService.update(
      clinicalCaseId,
      freelancer,
      updateClinicalCaseDto,
    );
    return {
      meessage: "Clinical case updated succesfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Patch(":clinicalCaseId/mcq/:mcqId")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER)
  @ApiOperation({ summary: "update an mcq inside clinical case" })
  async updateMcq(
    @Param("clinicalCaseId") clinicalCaseId: string,
    @Param("mcqId") mcqId: string,
    @Body() updateMcqDto: UpdateMcqDto,
    @GetUser() freelancer: Freelancer,
  ) {
    const data = await this.clinicalCaseService.updateMcqInClinicalCase(
      clinicalCaseId,
      mcqId,
      freelancer,
      updateMcqDto,
    );
    return {
      message: "Clinical case MCQ updated succesfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Delete(":clinicalCaseId")
  @ApiOperation({ summary: "delete clinical case" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER)
  async remove(
    @Param("clinicalCaseId") clinicalCaseId: string,
    @GetUser() freelancer: Freelancer,
  ) {
    await this.clinicalCaseService.remove(clinicalCaseId, freelancer);
    return {
      meessage: "Clinical case deleted succesfully",
      status: HttpStatus.OK,
    };
  }

  @Delete(":clinicalCaseId/mcq/:mcqId")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER)
  @ApiOperation({ summary: "remove an mcq from clinical case" })
  async removeMcqFromCase(
    @Param("clinicalCaseId") clinicalCaseId: string,
    @Param("mcqId") mcqId: string,
    @GetUser() freelancer: Freelancer,
  ) {
    await this.clinicalCaseService.removeMcqFromClinicalCase(
      clinicalCaseId,
      mcqId,
      freelancer,
    );
    return {
      message: "MCQ removed from clinical case succesfully",
      status: HttpStatus.OK,
    };
  }
}
