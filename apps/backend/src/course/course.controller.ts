import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
  Query,
  UseInterceptors,
  UploadedFile,
  DefaultValuePipe,
  ParseIntPipe,
  ParseBoolPipe,
} from "@nestjs/common";
import { CourseService } from "./course.service";
import { CreateCourseDto } from "./types/dto/create-course.dto";
import { UpdateCourseDto } from "./types/dto/update-course.dto";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import {
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { Roles } from "common/decorators/auth/roles.decorator";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { User } from "src/user/entities/user.entity";
import { FileInterceptor } from "@nestjs/platform-express";
import { MulterConfig } from "config/multer.config";
import { default_offset, default_page } from "shared/constants/pagination";

@ApiTags("Course")
@ApiBearerAuth()
@Controller("course")
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @ApiOperation({
    summary: "Create a new course",
    description:
      "Creates a new course with the provided details and attachment. Requires admin privileges.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          example: "Introduction to Mathematics",
          description: "Name of the course",
        },
        description: {
          type: "string",
          example: "A comprehensive introduction to mathematical concepts",
          description: "Description of the course",
        },
        subject: {
          type: "string",
          format: "uuid",
          example: "e87e5e5a-8ddc-4f69-9f7f-2e0ecbd1c574",
          description: "UUID of the subject this course belongs to",
        },
        attachment: {
          type: "string",
          format: "binary",
          description: "Course attachment file",
        },
      },
      required: ["name", "description", "subject", "attachment"],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Course created successfully",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "Course created successfully" },
        status: { type: "number", example: 201 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Course with this name already exists in this subject",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Attachment not provided",
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Forbidden resource",
  })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  @UseInterceptors(FileInterceptor("attachment", MulterConfig))
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @UploadedFile() attachment: Express.Multer.File,
  ) {
    const data = await this.courseService.create(createCourseDto, attachment);
    return {
      message: "Course created successfully",
      status: HttpStatus.CREATED,
    };
  }

  @Get()
  @ApiOperation({
    summary: "Get all courses paginated",
    description:
      "Retrieves a paginated list of courses with optional filtering capabilities",
  })
  @ApiQuery({
    name: "name",
    required: false,
    description: "Filter courses by name (partial match)",
    type: String,
  })
  @ApiQuery({
    name: "description",
    required: false,
    description: "Filter courses by description (partial match)",
    type: String,
  })
  @ApiQuery({
    name: "has_attachment",
    required: false,
    description: "Filter courses based on whether they have attachments",
    type: Boolean,
  })
  @ApiQuery({
    name: "subject",
    required: false,
    description: "Filter courses by subject ID (UUID)",
    type: String,
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
    description: "Courses fetched successfully",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "Courses fetched successfully" },
        status: { type: "number", example: 200 },
        data: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: {
                type: "object",
                $ref: "#/components/schemas/Course",
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
  async findAllCoursesPaginated(
    @Query("name") name?: string,
    @Query("description") description?: string,
    @Query("has_attachment", new ParseBoolPipe({ optional: true }))
    has_attachment?: boolean,
    @Query("subject", new ParseUUIDPipe({ optional: true })) subject?: string,
    @Query("page", new DefaultValuePipe(default_page), ParseIntPipe)
    page?: number,
    @Query("offset", new DefaultValuePipe(default_offset), ParseIntPipe)
    offset?: number,
  ) {
    const filters = {
      name,
      description,
      subject,
      has_attachment,
    };
    const pagination = { page, offset };

    const data = await this.courseService.findCoursesPaginated(
      filters,
      pagination,
    );
    return {
      message: "Courses fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get("/subject/:subjectId")
  @ApiOperation({
    summary: "Get courses by subject with user progress",
    description:
      "Retrieves a paginated list of courses for a specific subject with user progress information. Intended for the question/course page.",
  })
  @ApiParam({
    name: "subjectId",
    required: true,
    description: "UUID of the subject to get courses from",
    type: String,
    format: "uuid",
    example: "e87e5e5a-8ddc-4f69-9f7f-2e0ecbd1c574",
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
    description: "Courses fetched successfully with user progress",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "Course fetched successfully" },
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
                  attachment: { type: "string" },
                  attempted: {
                    type: "number",
                    description: "Number of MCQs attempted by the user",
                  },
                  total: {
                    type: "number",
                    description: "Total number of MCQs in the course",
                  },
                  progress_percentage: {
                    type: "number",
                    description: "Percentage of course completion",
                  },
                },
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
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "No subject was provided",
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Forbidden resource",
  })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.USER)
  async findBySubject(
    @GetUser() user: User,
    @Param("subjectId", ParseUUIDPipe) subjectId: string,
    @Query("page", new DefaultValuePipe(default_page), ParseIntPipe)
    page?: number,
    @Query("offset", new DefaultValuePipe(default_offset), ParseIntPipe)
    offset?: number,
  ) {
    const filters = { subject: subjectId };
    const pagination = { page, offset };
    const data = await this.courseService.getUserCoursesBySubjectPaginated(
      user.id,
      filters,
      pagination,
    );
    return {
      message: "Course fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get("/:courseId")
  @ApiOperation({
    summary: "Get course by ID",
    description:
      "Retrieves detailed information about a specific course by its ID",
  })
  @ApiParam({
    name: "courseId",
    required: true,
    description: "UUID of the course to retrieve",
    type: String,
    format: "uuid",
    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Course fetched successfully",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "Course fetched successfully" },
        status: { type: "number", example: 200 },
        data: {
          type: "object",
          $ref: "#/components/schemas/Course",
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Course was not found",
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  async findOne(@Param("courseId", ParseUUIDPipe) courseId: string) {
    const data = await this.courseService.getCourseById(courseId);
    return {
      message: "Course fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Patch("/:courseId")
  @ApiOperation({
    summary: "Update course details",
    description:
      "Updates the details of a specific course. Requires admin privileges.",
  })
  @ApiParam({
    name: "courseId",
    required: true,
    description: "UUID of the course to update",
    type: String,
    format: "uuid",
    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  })
  @ApiBody({
    type: UpdateCourseDto,
    description: "Course details to update",
    examples: {
      example1: {
        summary: "Update course name and description",
        value: {
          name: "Updated Course Name",
          description: "Updated course description",
        },
      },
      example2: {
        summary: "Change subject of course",
        value: {
          subject: "e87e5e5a-8ddc-4f69-9f7f-2e0ecbd1c574",
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Course updated successfully",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "Course updated successfully" },
        status: { type: "number", example: 200 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Course not found",
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Forbidden resource",
  })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  async update(
    @Param("courseId", ParseUUIDPipe) courseId: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    const data = await this.courseService.updateCourse(
      courseId,
      updateCourseDto,
    );
    return {
      message: "Course updated successfully",
      status: HttpStatus.OK,
    };
  }

  @Patch("/:courseId/attachment")
  @ApiOperation({
    summary: "Update course attachment",
    description:
      "Updates the attachment file for a specific course. Requires admin privileges.",
  })
  @ApiParam({
    name: "courseId",
    required: true,
    description: "UUID of the course to update attachment for",
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
          description: "New course attachment file",
        },
      },
      required: ["attachment"],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Course attachment updated successfully",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "Course updated successfully" },
        status: { type: "number", example: 200 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Attachment not provided or course not found",
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Forbidden resource",
  })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  @UseInterceptors(FileInterceptor("attachment", MulterConfig))
  async updateAttachment(
    @Param("courseId", new ParseUUIDPipe()) courseId: string,
    @UploadedFile() attachment: Express.Multer.File,
  ) {
    const data = await this.courseService.updateAttachment(
      courseId,
      attachment,
    );
    return {
      message: "Course updated successfully",
      status: HttpStatus.OK,
    };
  }

  @Delete(":courseId")
  @ApiOperation({
    summary: "Delete a course",
    description:
      "Permanently removes a course from the system. Requires admin privileges.",
  })
  @ApiParam({
    name: "courseId",
    required: true,
    description: "UUID of the course to delete",
    type: String,
    format: "uuid",
    example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Course deleted successfully",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "Course deleted successfully" },
        status: { type: "number", example: 200 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Course not found",
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Unauthorized" })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Forbidden resource",
  })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  async remove(@Param("courseId", new ParseUUIDPipe()) courseId: string) {
    const data = await this.courseService.removeCourse(courseId);
    return {
      message: "Course deleted successfully",
      status: HttpStatus.OK,
    };
  }
}
