import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  Query,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
  BadRequestException,
} from "@nestjs/common";
import { ProgressService } from "./progress.service";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { Roles } from "common/decorators/auth/roles.decorator";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";
import {
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger";
import { User } from "src/user/entities/user.entity";
import {
  ProgressCountBySingleFiltersInterface,
  ProgressCountByMultiFilterInterface,
} from "./types/interfaces/progress-count-filters.interface";
import { default_offset, default_page } from "shared/constants/pagination";
import { ProgressFilters } from "./types/interfaces/progress-filters.interface";
import { PaginationInterface } from "shared/interfaces/pagination.interface";
import { CreateProgressInterface } from "./types/interfaces/create-progress.interface";
import {
  default_comparison_period,
  default_recent_quiz_limit,
} from "shared/constants/analytics";
import { DateUtils } from "common/utils/date.util";

@ApiTags("Progress")
@ApiBearerAuth()
@Controller("progress")
@UseGuards(AccessTokenGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get("/")
  @ApiOperation({
    summary: "Get all user progress records with pagination (attempts)",
    description:
      "Retrieve paginated progress records for the authenticated user with optional filtering options. Results include performance data, time spent, and success ratios.",
  })
  @ApiQuery({
    name: "page",
    required: false,
    description: "Page number for pagination (default: 1)",
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: "offset",
    required: false,
    description: "Number of items per page (default: 10)",
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: "unit",
    required: false,
    description: "Filter by unit UUID",
    type: String,
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiQuery({
    name: "course",
    required: false,
    description: "Filter by course UUID",
    type: String,
    example: "123e4567-e89b-12d3-a456-426614174001",
  })
  @ApiQuery({
    name: "subject",
    required: false,
    description: "Filter by subject UUID",
    type: String,
    example: "123e4567-e89b-12d3-a456-426614174002",
  })
  @ApiQuery({
    name: "mcq",
    required: false,
    description: "Filter by MCQ UUID",
    type: String,
    example: "123e4567-e89b-12d3-a456-426614174003",
  })
  @ApiQuery({
    name: "time_spent_min",
    required: false,
    description: "Minimum time spent in seconds",
    type: Number,
    example: 30,
  })
  @ApiQuery({
    name: "time_spent_max",
    required: false,
    description: "Maximum time spent in seconds",
    type: Number,
    example: 300,
  })
  @ApiQuery({
    name: "success_ratio_min",
    required: false,
    description: "Minimum success ratio (0-1)",
    type: Number,
    example: 0.5,
  })
  @ApiQuery({
    name: "success_ratio_max",
    required: false,
    description: "Maximum success ratio (0-1)",
    type: Number,
    example: 1.0,
  })
  @ApiQuery({
    name: "response",
    required: false,
    description: "Filter by user's response text (for QROC type questions)",
    type: String,
  })
  @ApiQuery({
    name: "feedback",
    required: false,
    description: "Filter by feedback text",
    type: String,
  })
  @ApiQuery({
    name: "date",
    required: false,
    description:
      "Filter attempts to a specific calendar day (format: YYYY-MM-DD)",
    type: String,
    example: "2025-02-01",
  })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved progress records",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - Invalid parameters",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Missing or invalid authentication token",
  })
  @UseGuards(RolesGuard)
  @Roles(BaseRoles.USER)
  async findAll(
    @GetUser() user: JwtPayload,
    @Query("unit", new ParseUUIDPipe({ optional: true })) unit: string,
    @Query("course", new ParseUUIDPipe({ optional: true })) course: string,
    @Query("subject", new ParseUUIDPipe({ optional: true })) subject: string,
    @Query("mcq", new ParseUUIDPipe({ optional: true })) mcq: string,
    @Query("time_spent_min") time_spent_min: number,
    @Query("time_spent_max") time_spent_max: number,
    @Query("success_ratio_min") success_ratio_min: number,
    @Query("success_ratio_max") success_ratio_max: number,
    @Query("response") response: string,
    @Query("feedback") feedback: string,
    @Query("date") date?: string,
    @Query("page", new DefaultValuePipe(default_page), ParseIntPipe)
    page?: number,
    @Query("offset", new DefaultValuePipe(default_offset), ParseIntPipe)
    offset?: number,
  ) {
    const filters: ProgressFilters = {
      user: user.id,
      unit,
      course,
      subject,
      mcq,
      time_spent_min,
      time_spent_max,
      success_ratio_min,
      success_ratio_max,
      response,
      feedback,
    };
    if (date) {
      const validatedDate = DateUtils.validateDate(date);
      const { startOfDay, endOfDay } = DateUtils.getDayBoundaries(
        validatedDate,
      );
      filters.createdAtRange = {
        start: startOfDay,
        end: endOfDay,
      };
    }
    const pagination: PaginationInterface = {
      page,
      offset,
    };
    const data = await this.progressService.findProgressPaginated(
      filters,
      pagination,
    );
    return {
      message: "All progress fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get("/analytics")
  @ApiOperation({
    summary: "Get comprehensive user analytics",
    description:
      "Retrieves detailed analytics about user progress including overall performance, subject strengths, recent activity, and weekly comparisons. This endpoint provides a holistic view of the user's learning progress and performance trends.",
  })
  @ApiQuery({
    name: "recent_quiz_limit",
    required: false,
    description: "Limit for number of recent quizzes to return (default: 5)",
    type: Number,
    example: 5,
  })
  @ApiQuery({
    name: "week_comparison_period",
    required: false,
    description: "Number of days to compare with current week (default: 7)",
    type: Number,
    example: 7,
  })
  @ApiQuery({
    name: "include_trend_data",
    required: false,
    description: "Whether to include historical trend data (default: true)",
    type: Boolean,
    example: true,
  })
  @ApiQuery({
    name: "unit",
    required: false,
    description: "Filter analytics by unit UUID",
    type: String,
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiQuery({
    name: "course",
    required: false,
    description: "Filter analytics by course UUID",
    type: String,
    example: "123e4567-e89b-12d3-a456-426614174001",
  })
  @ApiQuery({
    name: "subject",
    required: false,
    description: "Filter analytics by subject UUID",
    type: String,
    example: "123e4567-e89b-12d3-a456-426614174002",
  })
  @ApiQuery({
    name: "from",
    required: false,
    description:
      "Start date for analytics filtering (inclusive, format: YYYY-MM-DD)",
    type: String,
    example: "2025-01-01",
  })
  @ApiQuery({
    name: "to",
    required: false,
    description:
      "End date for analytics filtering (inclusive, format: YYYY-MM-DD)",
    type: String,
    example: "2025-01-31",
  })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved user analytics",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Missing or invalid authentication token",
  })
  @UseGuards(RolesGuard)
  @Roles(BaseRoles.USER)
  async getUserAnalytics(
    @GetUser() user: JwtPayload,
    @Query(
      "recent_quiz_limit",
      new DefaultValuePipe(default_recent_quiz_limit),
      ParseIntPipe,
    )
    recent_quiz_limit?: number,
    @Query(
      "week_comparison_period",
      new DefaultValuePipe(default_comparison_period),
      ParseIntPipe,
    )
    week_comparison_period?: number,
    @Query("include_trend_data", new DefaultValuePipe(true))
    include_trend_data?: boolean,
    @Query("unit", new ParseUUIDPipe({ optional: true })) unit?: string,
    @Query("course", new ParseUUIDPipe({ optional: true })) course?: string,
    @Query("subject", new ParseUUIDPipe({ optional: true })) subject?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    if (from) {
      const validatedFrom = DateUtils.validateDate(from);
      fromDate = DateUtils.getDayBoundaries(validatedFrom).startOfDay;
    }

    if (to) {
      const validatedTo = DateUtils.validateDate(to);
      toDate = DateUtils.getDayBoundaries(validatedTo).endOfDay;
    }

    if (fromDate && toDate && toDate < fromDate) {
      throw new BadRequestException(
        "'to' date must be greater than or equal to 'from' date",
      );
    }

    const options = {
      recent_quiz_limit,
      week_comparison_period,
      include_trend_data,
      unit,
      course,
      subject,
      from: fromDate,
      to: toDate,
    };
    const data = await this.progressService.getUserAnalytics(user.id, options);

    return {
      message: "Analytics fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get("/count")
  @ApiOperation({
    summary: "Count unique MCQs completed by user",
    description:
      "Retrieves the count of distinct MCQs completed by the authenticated user, optionally filtered by unit, course, or subject. Useful for tracking progress and completion rates.",
  })
  @ApiQuery({
    name: "unit",
    required: false,
    description: "Filter by unit UUID",
    type: String,
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiQuery({
    name: "course",
    required: false,
    description: "Filter by course UUID",
    type: String,
    example: "123e4567-e89b-12d3-a456-426614174001",
  })
  @ApiQuery({
    name: "subject",
    required: false,
    description: "Filter by subject UUID",
    type: String,
    example: "123e4567-e89b-12d3-a456-426614174002",
  })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved progress count",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - Invalid parameters",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Missing or invalid authentication token",
  })
  @UseGuards(RolesGuard)
  @Roles(BaseRoles.USER)
  async countDistinctMcqsByUser(
    @GetUser() user: JwtPayload,
    @Query("unit", new ParseUUIDPipe({ optional: true })) unit: string,
    @Query("course", new ParseUUIDPipe({ optional: true })) course: string,
    @Query("subject", new ParseUUIDPipe({ optional: true })) subject: string,
  ) {
    const filters: ProgressCountBySingleFiltersInterface = {
      user: user.id,
      unit,
      course,
      subject,
    };
    const data = await this.progressService.countMcqsProgressBySingleFilter(
      filters,
      {
        distinct: true,
      },
    );
    return {
      message: "All progress count fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get("/accuracy-trend")
  @ApiOperation({
    summary: "Get user's accuracy trend over time",
    description:
      "Retrieves the historical accuracy data for the authenticated user to show performance trends over time. Useful for visualizing learning progress.",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of recent records to consider (default: 30)",
    type: Number,
    example: 30,
  })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved accuracy trend data",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Missing or invalid authentication token",
  })
  @UseGuards(RolesGuard)
  @Roles(BaseRoles.USER)
  async getAccuracyTrend(
    @GetUser() user: JwtPayload,
    @Query("limit", new DefaultValuePipe(30), ParseIntPipe) limit?: number,
  ) {
    const data = await this.progressService.getAccuracyOverTime(user.id, limit);
    return {
      message: "Accuracy trend fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get("/session/:sessionId/timeline")
  @ApiOperation({
    summary: "Get the replay timeline for a training session",
    description:
      "Returns the ordered list of attempts for a specific training session, including MCQ metadata and user responses.",
  })
  @ApiParam({
    name: "sessionId",
    description: "UUID of the training session",
    type: "string",
    format: "uuid",
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: "Successfully fetched session timeline",
  })
  @ApiResponse({
    status: 404,
    description: "No progress history found for this session",
  })
  @UseGuards(RolesGuard)
  @Roles(BaseRoles.USER)
  async getSessionTimeline(
    @GetUser() user: JwtPayload,
    @Param("sessionId", ParseUUIDPipe) sessionId: string,
  ) {
    const data = await this.progressService.getSessionTimeline(
      user.id,
      sessionId,
    );
    return {
      message: "Session timeline fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get("/:progressId")
  @ApiOperation({
    summary: "Get a specific progress record",
    description:
      "Retrieves detailed information about a specific progress record identified by its UUID. Only accessible by the user who owns the progress record.",
  })
  @ApiParam({
    name: "progressId",
    description: "UUID of the progress record to retrieve",
    type: "string",
    format: "uuid",
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: "Successfully retrieved progress record",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - Invalid progress ID format",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - Missing or invalid authentication token",
  })
  @ApiResponse({
    status: 403,
    description:
      "Forbidden - User does not have permission to access this progress record",
  })
  @ApiResponse({
    status: 404,
    description: "Progress record not found",
  })
  @UseGuards(RolesGuard)
  @Roles(BaseRoles.USER)
  async findOne(
    @Param("progressId", ParseUUIDPipe) progressId: string,
    @GetUser() user: User,
  ) {
    const data = await this.progressService.getOneProgress({
      progressId,
      userId: user.id,
    });
    return {
      message: "Progress fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }
}
