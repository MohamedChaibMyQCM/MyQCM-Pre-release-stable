import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  HttpStatus,
  Query,
  UseInterceptors,
  UploadedFile,
  DefaultValuePipe,
  ParseIntPipe,
  ParseEnumPipe,
  ParseBoolPipe,
} from "@nestjs/common";
import { McqService } from "./mcq.service";
import { McqEnrichmentService } from "./mcq-enrichment.service";
import { CreateMcqDto } from "./dto/create-mcq.dto";
import { UpdateMcqDto } from "./dto/update-mcq.dto";
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { Roles } from "common/decorators/auth/roles.decorator";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import {
  McqApprovalStatus,
  McqDifficulty,
  McqTag,
  McqType,
  QuizType,
} from "./dto/mcq.type";
import { Freelancer } from "src/freelancer/entities/freelancer.entity";
import { FileInterceptor } from "@nestjs/platform-express";
import { ParseFormDataInterceptor } from "abstract/form-data.interceptor";
import { MulterConfig } from "config/multer.config";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";
import { default_offset, default_page } from "shared/constants/pagination";
import { YearOfStudy } from "src/user/types/enums/user-study-year.enum";
import { SubmitMcqAttemptDto } from "./dto/submit-mcq-attempt.dto";
import { FacultyType } from "src/faculty/types/enums/faculty-type.enum";
import { McqBatchUploadMetadataDto } from "./dto/mcq-batch-upload.dto";
import { SpreadsheetMulterConfig } from "config/spreadsheet-multer.config";
import { ApproveMcqBulkDto } from "./dto/approve-mcq.dto";
import { McqAiEnrichmentRequestDto } from "./dto/mcq-ai-enrichment.dto";
@ApiTags("Mcq")
@Controller("mcq")
export class McqController {
  constructor(
    private readonly mcqService: McqService,
    private readonly mcqEnrichmentService: McqEnrichmentService,
  ) {}
  @Post()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER)
  @ApiOperation({ summary: "Create a new MCQ" })
  @ApiResponse({ status: 201, description: "MCQ created successfully" })
  @ApiResponse({ status: 400, description: "Invalid data provided" })
  @ApiBearerAuth("JWT-auth")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("attachment", MulterConfig),
    ParseFormDataInterceptor,
  )
  async create(
    @Body() createMcqDto: CreateMcqDto,
    @UploadedFile() attachment: Express.Multer.File,
    @GetUser() freelancer: JwtPayload,
  ) {
    const data = await this.mcqService.create(
      createMcqDto,
      attachment,
      freelancer,
    );
    return {
      message: `Mcq of type ${createMcqDto.type} cretaed succesfully`,
      status: HttpStatus.CREATED,
    };
  }

  @Post("/batch-upload")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER)
  @ApiOperation({ summary: "Bulk create MCQs from a spreadsheet" })
  @ApiResponse({
    status: 201,
    description: "Spreadsheet processed and MCQs created successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Spreadsheet could not be processed",
  })
  @ApiBearerAuth("JWT-auth")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("file", SpreadsheetMulterConfig),
    ParseFormDataInterceptor,
  )
  async batchUpload(
    @Body() metadata: McqBatchUploadMetadataDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() freelancer: JwtPayload,
  ) {
    const data = await this.mcqService.batchUploadFromSpreadsheet(
      file,
      metadata,
      freelancer,
    );

    return {
      message: `Imported ${data.created} question(s)`,
      status: HttpStatus.CREATED,
      data,
    };
  }

  @Post("/courses/:courseId/ai-enrichment")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN, BaseRoles.FREELANCER)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Queue AI enrichment for MCQs in a course",
    description:
      "Enqueues MCQs so the AI suggestion pipeline can generate knowledge component recommendations.",
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: "Enrichment job queued",
  })
  async enqueueAiEnrichment(
    @Param("courseId", ParseUUIDPipe) courseId: string,
    @Body() dto: McqAiEnrichmentRequestDto,
    @GetUser() requester: JwtPayload,
  ) {
    const data = await this.mcqEnrichmentService.enqueueForCourse(
      courseId,
      dto,
      requester,
    );

    return {
      message: `Queued ${data.queued} MCQ(s) for AI enrichment`,
      status: HttpStatus.ACCEPTED,
      data,
    };
  }

  @Post("/submit/:id")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.USER)
  @ApiOperation({ summary: "submit mcq attempt" })
  async submitMcq(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() submitMcqAttemptDto: SubmitMcqAttemptDto,
    @GetUser() user: JwtPayload,
  ) {
    const data = await this.mcqService.submiteMcqAttempt(
      user,
      id,
      submitMcqAttemptDto,
    );
    return {
      message: `Mcq attempt of submitted succesfully`,
      status: HttpStatus.CREATED,
      data,
    };
  }
  @Get()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @ApiQuery({ name: "type", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiOperation({
    summary:
      "find all mcq of all types (pagination) , you can pass query (type) to define the type",
  })
  async findMcqsPaginated(
    @Query("question") question?: string,
    @Query("explanation") explanation?: string,
    @Query("answer") answer?: string,
    @Query("keywords") keywords?: string[],
    @Query("type", new ParseEnumPipe(McqType, { optional: true }))
    type?: McqType,
    @Query("quiz_type", new ParseEnumPipe(QuizType, { optional: true }))
    quiz_type?: QuizType,
    @Query("mcq_tags", new ParseEnumPipe(McqTag, { optional: true }))
    mcq_tags?: McqTag | McqTag[],
    @Query("difficulty", new ParseEnumPipe(McqDifficulty, { optional: true }))
    difficulty?: McqDifficulty | McqDifficulty[],
    @Query("year_of_study", new ParseEnumPipe(YearOfStudy, { optional: true }))
    year_of_study?: YearOfStudy,
    @Query("in_clinical_case", new ParseBoolPipe({ optional: true }))
    in_clinical_case?: boolean,
    @Query("estimated_time_min")
    estimated_time_min?: number,
    @Query("estimated_time_max")
    estimated_time_max?: number,
    @Query("promo_min")
    promo_min?: number,
    @Query("promo_max")
    promo_max?: number,
    @Query("freelancer", new ParseUUIDPipe({ optional: true }))
    freelancer?: string,
    @Query("university", new ParseUUIDPipe({ optional: true }))
    university?: string,
    @Query("faculty", new ParseUUIDPipe({ optional: true })) faculty?: string,
    @Query("unit", new ParseUUIDPipe({ optional: true })) unit?: string,
    @Query("subject", new ParseUUIDPipe({ optional: true })) subject?: string,
    @Query("course", new ParseUUIDPipe({ optional: true })) course?: string,
    @Query("clinical_case", new ParseUUIDPipe({ optional: true }))
    clinical_case?: string,
    @Query("page", new DefaultValuePipe(default_page), ParseIntPipe)
    page?: number,
    @Query("offset", new DefaultValuePipe(default_offset), ParseIntPipe)
    offset?: number,
  ) {
    const filters = {
      question,
      explanation,
      answer,
      keywords,
      type,
      quiz_type,
      mcq_tags,
      difficulty,
      year_of_study,
      in_clinical_case,
      estimated_time_min,
      estimated_time_max,
      promo_min,
      promo_max,
      freelancer,
      university,
      faculty,
      unit,
      subject,
      course,
      clinical_case,
    };
    const pagination = {
      page,
      offset,
    };
    const data = await this.mcqService.findMcqsPaginated(filters, pagination);
    return {
      message: "Mcqs fetched succesfully",
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
    @GetUser() freelancer: JwtPayload,
    @Query("page", new DefaultValuePipe(default_page), ParseIntPipe)
    page?: number,
    @Query("offset", new DefaultValuePipe(default_offset), ParseIntPipe)
    offset?: number,
    @Query("type", new ParseEnumPipe(McqType, { optional: true }))
    type?: McqType,
    @Query(
      "approval_status",
      new ParseEnumPipe(McqApprovalStatus, { optional: true }),
    )
    approval_status?: McqApprovalStatus,
  ) {
    const data = await this.mcqService.findMcqsByFreelancerPaginated(
      freelancer.id,
      type,
      {
        page,
        offset,
      },
      approval_status ? { approval_status } : {},
    );
    return {
      message: "Mcqs fetched succesfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get("/count")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @ApiOperation({ summary: "get today and total mcq count " })
  async getMcqCount() {
    const data = await this.mcqService.getMcqCount();
    return {
      message: "Mcq fetched succesfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get("/:mcqId")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @ApiOperation({ summary: "get mcq by mcqId " })
  async getOne(@Param("mcqId", ParseUUIDPipe) mcqId: string) {
    const data = await this.mcqService.getOneMcq({ mcqId }, true);
    return {
      message: "Mcq fetched succesfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Post("approve")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER)
  @ApiOperation({ summary: "Approve a batch of MCQs" })
  async approveMany(
    @Body() payload: ApproveMcqBulkDto,
    @GetUser() freelancer: JwtPayload,
  ) {
    const result = await this.mcqService.approveMcqs(
      payload.mcqIds,
      freelancer,
    );
    return {
      message: `Approved ${result.updated} MCQ(s)`,
      status: HttpStatus.OK,
      data: result,
    };
  }

  @Post("approve/all")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER)
  @ApiOperation({ summary: "Approve all pending MCQs" })
  async approveAll(@GetUser() freelancer: JwtPayload) {
    const result = await this.mcqService.approveAllPending(freelancer);
    return {
      message: `Approved ${result.updated} MCQ(s)`,
      status: HttpStatus.OK,
      data: result,
    };
  }

  @Post(":mcqId/approve")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER)
  @ApiOperation({ summary: "Approve a single MCQ" })
  async approveOne(
    @Param("mcqId", ParseUUIDPipe) mcqId: string,
    @GetUser() freelancer: JwtPayload,
  ) {
    const mcq = await this.mcqService.approveMcq(mcqId, freelancer);
    return {
      message: "Mcq approved succesfully",
      status: HttpStatus.OK,
      data: {
        id: mcq.id,
        approval_status: mcq.approval_status,
      },
    };
  }

  @Patch(":mcqId")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER)
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("attachment", MulterConfig),
    ParseFormDataInterceptor,
  )
  @ApiOperation({
    summary:
      "update existing mcq (for everything including unit , faculty .....)",
  })
  async update(
    @Param("mcqId", ParseUUIDPipe) mcqId: string,
    @Body() updateMcqDto: UpdateMcqDto,
    @UploadedFile() attachment: Express.Multer.File,
    @GetUser() freelancer: Freelancer,
  ) {
    const data = await this.mcqService.update(
      mcqId,
      attachment,
      freelancer.id,
      updateMcqDto,
    );
    return {
      message: "Mcqs updated succesfully",
      status: HttpStatus.OK,
    };
  }

  @Delete(":mcqId")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER)
  @ApiOperation({ summary: "delete existing mcq" })
  async removeMcq(
    @Param("mcqId", ParseUUIDPipe) mcqId: string,
    @GetUser() freelancer: Freelancer,
  ) {
    const data = await this.mcqService.removeMcq(mcqId, freelancer);
    return {
      message: "Mcqs deleted succesfully",
      status: HttpStatus.OK,
    };
  }
}
