import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
  Query,
  ParseEnumPipe,
  ParseBoolPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from "@nestjs/common";
import { TrainingSessionService } from "./training-session.service";
import { CreateTrainingSessionDto } from "./types/dtos/create-training-session.dto";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { TrainingSessionStatus } from "./types/enums/training-session.enum";
import { TrainingSessionFilters } from "./types/interfaces/training-session-filters.interface";
import { ParseDatePipe } from "common/pipes/parse-date.pipe";
import { default_offset, default_page } from "shared/constants/pagination";
import { PaginationInterface } from "shared/interfaces/pagination.interface";

@ApiTags("Training Session")
@Controller("training-session")
@UseGuards(AccessTokenGuard)
export class TrainingSessionController {
  constructor(
    private readonly trainingSessionService: TrainingSessionService,
  ) {}

  @Post()
  async createNewTrainingSession(
    @GetUser() user: JwtPayload,
    @Body() createTrainingSessionDto: CreateTrainingSessionDto,
  ) {
    const data = await this.trainingSessionService.create(
      user.id,
      createTrainingSessionDto,
    );
    return {
      message: "session created",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get("/")
  @ApiOperation({ summary: "Get paginated training sessions for a user" })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number",
  })
  @ApiQuery({
    name: "offset",
    required: false,
    type: Number,
    description: "Number of items per page",
  })
  @ApiQuery({ name: "title", required: false, type: String })
  @ApiQuery({ name: "qcm", required: false, type: Boolean })
  @ApiQuery({ name: "qcs", required: false, type: Boolean })
  @ApiQuery({ name: "time_limit_min", required: false, type: Number })
  @ApiQuery({ name: "time_limit_max", required: false, type: Number })
  @ApiQuery({ name: "number_of_questions_min", required: false, type: Number })
  @ApiQuery({ name: "number_of_questions_max", required: false, type: Number })
  @ApiQuery({
    name: "randomize_questions_order",
    required: false,
    type: Boolean,
  })
  @ApiQuery({ name: "randomize_options_order", required: false, type: Boolean })
  @ApiQuery({ name: "status", required: false, enum: TrainingSessionStatus })
  @ApiQuery({
    name: "scheduled_at",
    required: false,
    type: String,
    description: "ISO format date",
  })
  @ApiQuery({
    name: "completed_at",
    required: false,
    type: String,
    description: "ISO format date",
  })
  @ApiQuery({ name: "course", required: false, type: String })
  @ApiResponse({ status: 200, description: "Returns paginated sessions" })
  async findUserPaginatedSessions(
    @GetUser() user: JwtPayload,
    @Query("title") title?: string,
    @Query("time_limit_min") time_limit_min?: number,
    @Query("time_limit_max") time_limit_max?: number,
    @Query("number_of_questions_min") number_of_questions_min?: number,
    @Query("number_of_questions_max") number_of_questions_max?: number,
    @Query("qcm", new ParseBoolPipe({ optional: true })) qcm?: boolean,
    @Query("qcs", new ParseBoolPipe({ optional: true })) qcs?: boolean,
    @Query("randomize_questions_order", new ParseBoolPipe({ optional: true }))
    randomize_questions_order?: boolean,
    @Query("randomize_options_order", new ParseBoolPipe({ optional: true }))
    randomize_options_order?: boolean,
    @Query(
      "status",
      new ParseEnumPipe(TrainingSessionStatus, { optional: true }),
    )
    status?: TrainingSessionStatus,
    @Query("scheduled_at", new ParseDatePipe()) scheduled_at?: Date,
    @Query("completed_at", new ParseDatePipe()) completed_at?: Date,
    @Query("course", new ParseUUIDPipe({ optional: true })) course?: string,
    @Query("page", new DefaultValuePipe(default_page), ParseIntPipe)
    page?: number,
    @Query("offset", new DefaultValuePipe(default_offset), ParseIntPipe)
    offset?: number,
  ) {
    const filters: TrainingSessionFilters = {
      title,
      qcm,
      qcs,
      time_limit_min,
      time_limit_max,
      number_of_questions_min,
      number_of_questions_max,
      randomize_questions_order,
      randomize_options_order,
      status,
      scheduled_at,
      completed_at,
      user: user.id,
      course,
    };

    const pagination: PaginationInterface = {
      page,
      offset,
    };
    const data = await this.trainingSessionService.findSessionsPaginated(
      filters,
      pagination,
    );

    return {
      message: "User Sessions found",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get("/:id")
  async getOne(
    @Param("id", ParseUUIDPipe) id: string,
    @GetUser() user: JwtPayload,
  ) {
    const data = await this.trainingSessionService.getSession({
      userId: user.id,
      sessionId: id,
    });
    return {
      message: "Session found",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get("/:id/complete")
  @ApiOperation({
    summary: "complete training session and get result ",
  })
  async completeTrainingSession(
    @Param("id", ParseUUIDPipe) id: string,
    @GetUser() user: JwtPayload,
  ) {
    const data = await this.trainingSessionService.completeSession(user.id, id);
    return {
      message: "Session completed",
      status: HttpStatus.OK,
      data,
    };
  }

  @ApiOperation({
    summary: "get session mcqs to solve",
  })
  @Get("/:id/mcq")
  async getSessionMcqsToSolve(
    @Param("id", ParseUUIDPipe) id: string,
    @GetUser() user: JwtPayload,
  ) {
    const data = await this.trainingSessionService.getSessionMcqs(user.id, id);
    return {
      message: "Session mcqs retreived",
      status: HttpStatus.OK,
      data,
    };
  }

  @Delete(":id")
  async remove(
    @Param("id", ParseUUIDPipe) id: string,
    @GetUser() user: JwtPayload,
  ) {
    const data = await this.trainingSessionService.remove({
      sessionId: id,
      userId: user.id,
    });
    return {
      message: "Session deleted",
      status: HttpStatus.OK,
    };
  }
}
