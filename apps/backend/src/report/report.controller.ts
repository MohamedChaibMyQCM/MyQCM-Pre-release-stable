import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  ParseEnumPipe,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { ReportService } from "./report.service";
import { CreateReportDto } from "./dto/create-report.dto";
import { UpdateReportDto } from "./dto/update-report.dto";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { Roles } from "common/decorators/auth/roles.decorator";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiQuery,
  ApiConsumes,
} from "@nestjs/swagger";
import { ResponseInterface } from "shared/interfaces/response.interface";
import { Report } from "./entities/report.entity";
import { PaginatedResponse } from "shared/interfaces/paginated.response.interface";

import { IReportFilters } from "./type/interface/report-filter.interface";
import { default_offset, default_page } from "shared/constants/pagination";
import { PaginationInterface } from "shared/interfaces/pagination.interface";
import { ReportSeverity } from "./type/enum/report-severity.enum";
import { ReportCategory } from "./type/enum/report-category.enum";
import { ReportStatus } from "./type/enum/report-status.enum";
import { ParseFormDataInterceptor } from "abstract/form-data.interceptor";
import { FileInterceptor } from "@nestjs/platform-express";
import { MulterConfig } from "config/multer.config";

@ApiTags("Reports")
@ApiBearerAuth()
@Controller("report")
@UseGuards(AccessTokenGuard, RolesGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @Roles(BaseRoles.USER)
  @UseInterceptors(
    FileInterceptor("screenshot", MulterConfig),
    ParseFormDataInterceptor,
  )
  @ApiOperation({
    summary: "Create a new report",
    description:
      "Creates a new report for the authenticated user. Requires user role.",
  })
  @ApiBody({ type: CreateReportDto, description: "Report data to create" })
  @ApiCreatedResponse({
    description: "Report created successfully",
    type: Report,
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        screenshot: {
          type: "string",
          format: "binary",
          description: "Screenshot file to upload",
        },
        title: {
          type: "string",
          description: "Report title",
        },
        category: {
          type: "string",
          enum: Object.values(ReportCategory),
          description: "Report category",
        },
        description: {
          type: "string",
          description: "Report description",
        },
        severity: {
          type: "string",
          enum: Object.values(ReportSeverity),
          description: "Report severity",
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiForbiddenResponse({ description: "Forbidden - requires user role" })
  async create(
    @Body() createReportDto: CreateReportDto,
    @UploadedFile() screenshot: Express.Multer.File,
    @GetUser() user: JwtPayload,
  ): Promise<ResponseInterface<Report>> {
    const data = await this.reportService.create(
      createReportDto,
      screenshot,
      user.id,
    );
    return {
      message: "Report created successfully",
      status: HttpStatus.CREATED,
      data,
    };
  }

  @Get("/my-reports")
  @Roles(BaseRoles.USER)
  @ApiOperation({
    summary: "Get all reports for the authenticated user",
    description:
      "Retrieves reports created by the authenticated user with pagination and filtering. Requires user role.",
  })
  @ApiQuery({
    name: "page",
    description: "Page number",
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: "offset",
    description: "Items per page",
    required: false,
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: "title",
    description: "Filter by report title (partial match)",
    required: false,
    type: String,
  })
  @ApiQuery({
    name: "status",
    description: "Filter by report status",
    required: false,
    enum: ReportStatus,
  })
  @ApiQuery({
    name: "category",
    description: "Filter by report category",
    required: false,
    enum: ReportCategory,
  })
  @ApiQuery({
    name: "severity",
    description: "Filter by report severity",
    required: false,
    enum: ReportSeverity,
  })
  @ApiQuery({
    name: "status_in",
    description: "Filter by multiple report statuses (comma-separated)",
    required: false,
    isArray: true,
    enum: ReportStatus,
  })
  @ApiQuery({
    name: "category_in",
    description: "Filter by multiple report categories (comma-separated)",
    required: false,
    isArray: true,
    enum: ReportCategory,
  })
  @ApiQuery({
    name: "severity_in",
    description: "Filter by multiple report severities (comma-separated)",
    required: false,
    isArray: true,
    enum: ReportSeverity,
  })
  @ApiOkResponse({
    description: "User's reports fetched successfully",
  })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiForbiddenResponse({ description: "Forbidden - requires user role" })
  async getUserReports(
    @GetUser() user: JwtPayload,
    @Query("title") title?: string,
    @Query("status", new ParseEnumPipe(ReportStatus, { optional: true }))
    status?: ReportStatus,
    @Query("category", new ParseEnumPipe(ReportCategory, { optional: true }))
    category?: ReportCategory,
    @Query("severity", new ParseEnumPipe(ReportSeverity, { optional: true }))
    severity?: ReportSeverity,
    @Query("status_in") status_in?: string,
    @Query("category_in") category_in?: string,
    @Query("severity_in") severity_in?: string,
    @Query("page", new DefaultValuePipe(default_page), ParseIntPipe)
    page?: number,
    @Query("offset", new DefaultValuePipe(default_offset), ParseIntPipe)
    offset?: number,
  ): Promise<ResponseInterface<PaginatedResponse<Report>>> {
    const filters: IReportFilters = {
      user_id: user.id, // Automatically filter by the authenticated user's ID
      title,
      status,
      category,
      severity,
      status_in: status_in
        ? status_in.split(",").map((s) => s.trim() as ReportStatus)
        : undefined,
      category_in: category_in
        ? category_in.split(",").map((c) => c.trim() as ReportCategory)
        : undefined,
      severity_in: severity_in
        ? severity_in.split(",").map((s) => s.trim() as ReportSeverity)
        : undefined,
    };
    const pagination: PaginationInterface = {
      page,
      offset,
    };
    const data = await this.reportService.findAll(filters, pagination);
    return {
      message: "User's reports fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }
  @Get()
  @Roles(BaseRoles.ADMIN)
  @ApiOperation({
    summary: "Get all reports",
    description:
      "Retrieves reports with pagination and filtering. Requires admin role.",
  })
  @ApiQuery({
    name: "page",
    description: "Page number",
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: "offset",
    description: "Items per page",
    required: false,
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: "title",
    description: "Filter by report title (partial match)",
    required: false,
    type: String,
  })
  @ApiQuery({
    name: "status",
    description: "Filter by report status",
    required: false,
    enum: ReportStatus,
  })
  @ApiQuery({
    name: "category",
    description: "Filter by report category",
    required: false,
    enum: ReportCategory,
  })
  @ApiQuery({
    name: "severity",
    description: "Filter by report severity",
    required: false,
    enum: ReportSeverity,
  })
  @ApiQuery({
    name: "user_id",
    description: "Filter by user ID who created the report",
    required: false,
    type: String,
  })
  @ApiQuery({
    name: "status_in",
    description: "Filter by multiple report statuses (comma-separated)",
    required: false,
    isArray: true,
    enum: ReportStatus,
  })
  @ApiQuery({
    name: "category_in",
    description: "Filter by multiple report categories (comma-separated)",
    required: false,
    isArray: true,
    enum: ReportCategory,
  })
  @ApiQuery({
    name: "severity_in",
    description: "Filter by multiple report severities (comma-separated)",
    required: false,
    isArray: true,
    enum: ReportSeverity,
  })
  @ApiOkResponse({
    description: "Reports fetched successfully",
  })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiForbiddenResponse({ description: "Forbidden - requires admin role" })
  async findAll(
    @Query("title") title?: string,
    @Query("status", new ParseEnumPipe(ReportStatus, { optional: true }))
    status?: ReportStatus,
    @Query("category", new ParseEnumPipe(ReportCategory, { optional: true }))
    category?: ReportCategory,
    @Query("severity", new ParseEnumPipe(ReportSeverity, { optional: true }))
    severity?: ReportSeverity,
    @Query("user_id", new ParseUUIDPipe({ optional: true }))
    user_id?: string,
    @Query("status_in") status_in?: string,
    @Query("category_in") category_in?: string,
    @Query("severity_in") severity_in?: string,
    @Query("page", new DefaultValuePipe(default_page), ParseIntPipe)
    page?: number,
    @Query("offset", new DefaultValuePipe(default_offset), ParseIntPipe)
    offset?: number,
  ): Promise<ResponseInterface<PaginatedResponse<Report>>> {
    const filters: IReportFilters = {
      title,
      status,
      category,
      severity,
      user_id,
      status_in: status_in
        ? status_in.split(",").map((s) => s.trim() as ReportStatus)
        : undefined,
      category_in: category_in
        ? category_in.split(",").map((c) => c.trim() as ReportCategory)
        : undefined,
      severity_in: severity_in
        ? severity_in.split(",").map((s) => s.trim() as ReportSeverity)
        : undefined,
    };
    const pagination: PaginationInterface = {
      page,
      offset,
    };
    const data = await this.reportService.findAll(filters, pagination);
    return {
      message: "Reports fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get(":id")
  @Roles(BaseRoles.ADMIN)
  @ApiOperation({
    summary: "Get report by ID",
    description: "Retrieves a specific report by its ID. Requires admin role.",
  })
  @ApiParam({
    name: "id",
    description: "Report ID (UUID)",
    required: true,
    type: String,
  })
  @ApiOkResponse({
    description: "Report fetched successfully",
    type: Report,
  })
  @ApiNotFoundResponse({ description: "Report not found" })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiForbiddenResponse({ description: "Forbidden - requires admin role" })
  async findOne(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ResponseInterface<Report>> {
    const data = await this.reportService.getOne({ id }); // Using getOne to throw NotFoundException
    return {
      message: "Report fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get("/my-reports/:id")
  @Roles(BaseRoles.USER)
  @ApiOperation({
    summary: "Get report by ID",
    description: "Retrieves a specific report by its ID. Requires admin role.",
  })
  @ApiParam({
    name: "id",
    description: "Report ID (UUID)",
    required: true,
    type: String,
  })
  @ApiOkResponse({
    description: "Report fetched successfully",
    type: Report,
  })
  @ApiNotFoundResponse({ description: "Report not found" })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiForbiddenResponse({ description: "Forbidden - requires admin role" })
  async findOneUserReport(
    @Param("id", ParseUUIDPipe) id: string,
    @GetUser() user: JwtPayload,
  ): Promise<ResponseInterface<Report>> {
    const data = await this.reportService.getOne({ id, userId: user.id }, [
      "screenshot",
    ]);
    return {
      message: "Report fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Patch(":id")
  @Roles(BaseRoles.ADMIN)
  @ApiOperation({
    summary: "Update report",
    description: "Updates an existing report. Requires admin role.",
  })
  @ApiParam({
    name: "id",
    description: "Report ID (UUID)",
    required: true,
    type: String,
  })
  @ApiBody({ type: UpdateReportDto, description: "Updated report data" })
  @ApiOkResponse({
    description: "Report updated successfully",
    type: Report,
  })
  @ApiNotFoundResponse({ description: "Report not found" })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiForbiddenResponse({ description: "Forbidden - requires admin role" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateReportDto: UpdateReportDto,
  ): Promise<ResponseInterface<Report>> {
    const data = await this.reportService.update(id, updateReportDto);
    return {
      message: "Report updated successfully",
      status: HttpStatus.OK,
      data,
    };
  }
}
