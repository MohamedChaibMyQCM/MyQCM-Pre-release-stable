import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
  Query,
  UseInterceptors,
  DefaultValuePipe,
  ParseIntPipe,
  ParseUUIDPipe,
  ParseEnumPipe,
  UploadedFiles,
} from "@nestjs/common";
import { SubjectService } from "./subject.service";
import { CreateSubjectDto } from "./types/dto/create-subject.dto";
import { UpdateSubjectDto } from "./types/dto/update-subject.dto";
import {
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from "@nestjs/swagger";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { Roles } from "common/decorators/auth/roles.decorator";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { MulterConfig } from "config/multer.config";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { YearOfStudy } from "src/user/types/enums/user-study-year.enum";
import { PaginationInterface } from "shared/interfaces/pagination.interface";
import { default_offset, default_page } from "shared/constants/pagination";
import { SubjectFilters } from "./types/interfaces/subject-filters.interface";
import { SubjectSemestre } from "./types/dto/subject.type";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";

@ApiTags("Subject")
@ApiBearerAuth()
@Controller("subject")
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Post()
  @ApiOperation({
    summary: "Create new subject (module)",
    description:
      "Creates a new subject with the provided details and attachment. Requires admin privileges.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          example: "Anatomy 101",
          description: "Name of the subject",
        },
        description: {
          type: "string",
          example: "Introduction to human anatomy",
          description: "Description of the subject",
        },
        year_of_study: {
          type: "string",
          enum: Object.values(YearOfStudy),
          example: YearOfStudy.first_year,
          description: "Year of study for this subject",
        },
        subject_semestre: {
          type: "string",
          enum: Object.values(SubjectSemestre),
          example: SubjectSemestre.first_semestre,
          description: "Semester (required for first year subjects)",
        },
        unit: {
          type: "string",
          format: "uuid",
          example: "e87e5e5a-8ddc-4f69-9f7f-2e0ecbd1c574",
          description: "UUID of the unit this subject belongs to",
        },
        icon: {
          type: "string",
          format: "binary",
          description: "Subject attachment file",
        },
        banner: {
          type: "string",
          format: "binary",
          description: "Subject attachment file",
        },
      },
      required: ["name", "description", "year_of_study", "attachment"],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Subject created successfully",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "subject created successfully" },
        status: { type: "number", example: 201 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      "Validation failed (e.g. attachment not provided, first year subject without semester)",
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      "Unit year of study is not compatible with subject year of study",
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Forbidden resource",
  })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "icon", maxCount: 1 },
        { name: "banner", maxCount: 1 },
      ],
      MulterConfig,
    ),
  )
  async create(
    @Body() createSubjectDto: CreateSubjectDto,
    @UploadedFiles()
    attachments: {
      icon?: Express.Multer.File[];
      banner?: Express.Multer.File[];
    },
  ) {
    const data = await this.subjectService.create(
      createSubjectDto,
      attachments,
    );
    return {
      message: "subject created successfully",
      status: HttpStatus.CREATED,
    };
  }

  @Get("")
  @ApiOperation({
    summary: "Get all subjects with pagination and filtering",
    description:
      "Retrieves a paginated list of subjects with various filtering options",
  })
  @ApiQuery({
    name: "name",
    required: false,
    description: "Filter subjects by name (partial match)",
    type: String,
  })
  @ApiQuery({
    name: "description",
    required: false,
    description: "Filter subjects by description (partial match)",
    type: String,
  })
  @ApiQuery({
    name: "year_of_study",
    required: false,
    description: "Filter subjects by year of study",
    enum: YearOfStudy,
  })
  @ApiQuery({
    name: "subject_semestre",
    required: false,
    description: "Filter subjects by semester",
    enum: SubjectSemestre,
  })
  @ApiQuery({
    name: "unit",
    required: false,
    description: "Filter subjects by unit ID (UUID)",
    type: String,
  })
  @ApiQuery({
    name: "has_attachment",
    required: false,
    description: "Filter subjects based on whether they have attachments",
    type: Boolean,
  })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number for pagination",
    type: Number,
    example: default_page,
  })
  @ApiQuery({
    name: "offset",
    required: false,
    description: "Number of records per page",
    type: Number,
    example: default_offset,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Subjects fetched successfully",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "subjects fetched successfully" },
        status: { type: "number", example: 200 },
        data: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: {
                type: "object",
                $ref: "#/components/schemas/Subject",
              },
            },
            total: { type: "number", example: 25 },
            page: { type: "number", example: 1 },
            offset: { type: "number", example: 10 },
            total_pages: { type: "number", example: 3 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  async findAll(
    @Query("name") name?: string,
    @Query("description") description?: string,
    @Query("year_of_study", new ParseEnumPipe(YearOfStudy, { optional: true }))
    year_of_study?: YearOfStudy,
    @Query(
      "subject_semestre",
      new ParseEnumPipe(SubjectSemestre, { optional: true }),
    )
    subject_semestre?: SubjectSemestre,
    @Query("unit", new ParseUUIDPipe({ optional: true })) unit?: string,
    @Query("has_icon") has_icon?: boolean,
    @Query("has_banner") has_banner?: boolean,

    @Query("page", new DefaultValuePipe(default_page), ParseIntPipe)
    page?: number,
    @Query("offset", new DefaultValuePipe(default_offset), ParseIntPipe)
    offset?: number,
  ) {
    const pagination: PaginationInterface = { page, offset };
    const filters: SubjectFilters = {
      name,
      description,
      year_of_study,
      subject_semestre,
      unit,
      has_banner,
      has_icon,
    };
    const data = await this.subjectService.findSubjectsPaginated(
      filters,
      pagination,
    );
    return {
      message: "subjects fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get("/me")
  @ApiOperation({
    summary: "Get subjects for current user",
    description:
      "Retrieves all subjects for the authenticated user based on their year of study, including progress information",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Subjects fetched successfully with progress information",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "subject fetched successfully" },
        status: { type: "number", example: 200 },
        data: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  name: { type: "string" },
                  description: { type: "string" },
                  year_of_study: {
                    type: "string",
                    enum: Object.values(YearOfStudy),
                  },
                  subject_semestre: {
                    type: "string",
                    enum: Object.values(SubjectSemestre),
                    nullable: true,
                  },
                  attachment: { type: "string" },
                  unit: { type: "object", nullable: true },
                  attempted: {
                    type: "number",
                    description: "Number of MCQs attempted by the user",
                  },
                  total: {
                    type: "number",
                    description: "Total number of MCQs in the subject",
                  },
                  progress_percentage: {
                    type: "number",
                    description: "Percentage of subject completion",
                  },
                },
              },
            },
            total: { type: "number", example: 10 },
            page: { type: "number", example: 1 },
            offset: { type: "number", example: 10 },
            total_pages: { type: "number", example: 1 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Forbidden resource",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "User profile not found or email not verified",
  })
  @ApiQuery({
    name: "name",
    required: false,
    description: "Filter subjects by name (partial match)",
    type: String,
  })
  @ApiQuery({
    name: "description",
    required: false,
    description: "Filter subjects by description (partial match)",
    type: String,
  })
  @ApiQuery({
    name: "subject_semestre",
    required: false,
    description: "Filter subjects by semester",
    enum: SubjectSemestre,
  })
  @ApiQuery({
    name: "unit",
    required: false,
    description: "Filter subjects by unit ID (UUID)",
    type: String,
  })
  @ApiQuery({
    name: "has_attachment",
    required: false,
    description: "Filter subjects based on whether they have attachments",
    type: Boolean,
  })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number for pagination",
    type: Number,
    example: default_page,
  })
  @ApiQuery({
    name: "offset",
    required: false,
    description: "Number of records per page",
    type: Number,
    example: default_offset,
  })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.USER)
  async getSubjectsForUser(
    @GetUser() user: JwtPayload,
    @Query("name") name?: string,
    @Query("description") description?: string,
    @Query(
      "subject_semestre",
      new ParseEnumPipe(SubjectSemestre, { optional: true }),
    )
    subject_semestre?: SubjectSemestre,
    @Query("unit", new ParseUUIDPipe({ optional: true })) unit?: string,
    @Query("has_icon") has_icon?: boolean,
    @Query("has_banner") has_banner?: boolean,
    @Query("page", new DefaultValuePipe(default_page), ParseIntPipe)
    page?: number,
    @Query("offset", new DefaultValuePipe(default_offset), ParseIntPipe)
    offset?: number,
  ) {
    const pagination: PaginationInterface = { page, offset };
    const filters: SubjectFilters = {
      name,
      description,
      subject_semestre,
      unit,
      has_banner,
      has_icon,
    };
    const data = await this.subjectService.getSubjectsForUser(
      user.id,
      filters,
      pagination,
    );
    return {
      message: "subject fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get("/:subjectId")
  @ApiOperation({
    summary: "Get subject by ID",
    description:
      "Retrieves detailed information about a specific subject by its ID",
  })
  @ApiParam({
    name: "subjectId",
    required: true,
    description: "UUID of the subject to retrieve",
    type: String,
    format: "uuid",
    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Subject fetched successfully",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "Subject fetched successfully" },
        status: { type: "number", example: 200 },
        data: {
          type: "object",
          $ref: "#/components/schemas/Subject",
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Subject not found",
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  async findOne(@Param("subjectId", ParseUUIDPipe) subjectId: string) {
    const data = await this.subjectService.getSubject(subjectId);
    return {
      message: "Subject fetched successfully",
      status: HttpStatus.OK,
      data: data,
    };
  }

  @Patch("/attachment/:subjectId")
  @ApiOperation({
    summary: "Update subject attachment",
    description:
      "Updates the attachment file for a specific subject. Requires admin privileges.",
  })
  @ApiParam({
    name: "subjectId",
    required: true,
    description: "UUID of the subject to update attachment for",
    type: String,
    format: "uuid",
    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        attachment: {
          type: "string",
          format: "binary",
          description: "New subject attachment file",
        },
      },
      required: ["attachment"],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Subject attachment updated successfully",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "subject updated successfully" },
        status: { type: "number", example: 200 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Attachment not provided",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Subject not found",
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Forbidden resource",
  })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "icon", maxCount: 1 },
        { name: "banner", maxCount: 1 },
      ],
      MulterConfig,
    ),
  )
  async updateAttachment(
    @Param("subjectId", ParseUUIDPipe) subjectId: string,
    @UploadedFiles()
    attachments: {
      icon?: Express.Multer.File[];
      banner?: Express.Multer.File[];
    },
  ) {
    const data = await this.subjectService.updateAttachments(
      subjectId,
      attachments,
    );
    return {
      message: "subject updated successfully",
      status: HttpStatus.OK,
    };
  }

  @Patch(":subjectId")
  @ApiOperation({
    summary: "Update subject details",
    description:
      "Updates the details of a specific subject including unit association. Requires admin privileges.",
  })
  @ApiParam({
    name: "subjectId",
    required: true,
    description: "UUID of the subject to update",
    type: String,
    format: "uuid",
    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  })
  @ApiBody({
    type: UpdateSubjectDto,
    description: "Subject details to update",
    examples: {
      example1: {
        summary: "Update subject name and description",
        value: {
          name: "Updated Subject Name",
          description: "Updated subject description",
        },
      },
      example2: {
        summary: "Change year of study and unit",
        value: {
          year_of_study: YearOfStudy.second_year,
          unit: "e87e5e5a-8ddc-4f69-9f7f-2e0ecbd1c574",
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: "Subject updated successfully",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "subject updated successfully" },
        status: { type: "number", example: 202 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Validation failed (e.g. non-first year subject without unit)",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Subject not found",
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Forbidden resource",
  })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  async update(
    @Param("subjectId", ParseUUIDPipe) subjectId: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
  ) {
    const data = await this.subjectService.update(subjectId, updateSubjectDto);
    return {
      message: "subject updated successfully",
      status: HttpStatus.ACCEPTED,
    };
  }

  @Delete(":subjectId")
  @ApiOperation({
    summary: "Delete a subject",
    description:
      "Permanently removes a subject from the system. Requires admin privileges.",
  })
  @ApiParam({
    name: "subjectId",
    required: true,
    description: "UUID of the subject to delete",
    type: String,
    format: "uuid",
    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: "Subject deleted successfully",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "subject deleted successfully" },
        status: { type: "number", example: 202 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Subject not found",
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Forbidden resource",
  })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  async remove(@Param("subjectId", ParseUUIDPipe) subjectId: string) {
    const data = await this.subjectService.remove(subjectId);
    return {
      message: "subject deleted successfully",
      status: HttpStatus.ACCEPTED,
    };
  }
}
