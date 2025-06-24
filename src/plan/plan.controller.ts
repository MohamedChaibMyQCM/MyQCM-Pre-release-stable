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
  DefaultValuePipe,
  ParseIntPipe,
  ParseBoolPipe,
  ParseEnumPipe,
} from "@nestjs/common";
import { PlanService } from "./plan.service";
import { CreatePlanDto } from "./types/dtos/create-plan.dto";
import { UpdatePlanDto } from "./types/dtos/update-plan.dto";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { Roles } from "common/decorators/auth/roles.decorator";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { ResponseInterface } from "shared/interfaces/response.interface";
import { Plan } from "./entities/plan.entity";
import { PaginatedResponse } from "shared/interfaces/paginated.response.interface";
import { PlanFilters } from "./types/interfaces/plan-filters.interface";
import { PlanPeriod } from "./types/dtos/plan.type";
import { default_offset, default_page } from "shared/constants/pagination";
import { PaginationInterface } from "shared/interfaces/pagination.interface";
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from "@nestjs/swagger";

@ApiTags("Plans")
@ApiBearerAuth()
@Controller("plan")
@UseGuards(AccessTokenGuard)
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(BaseRoles.ADMIN)
  @ApiOperation({
    summary: "Create a new plan",
    description: "Creates a new subscription plan. Requires admin role.",
  })
  @ApiBody({ type: CreatePlanDto, description: "Plan data to create" })
  @ApiCreatedResponse({
    description: "Plan created successfully",
  })
  @ApiConflictResponse({
    description: "Plan name already exists or default plan already exists",
  })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiForbiddenResponse({ description: "Forbidden - requires admin role" })
  async createNewPlan(
    @Body() createPlanDto: CreatePlanDto,
  ): Promise<ResponseInterface<Plan>> {
    const data = await this.planService.createNewPlan(createPlanDto);
    return {
      message: "Plan created successfully",
      status: HttpStatus.CREATED,
      data,
    };
  }

  @Get()
  @ApiOperation({
    summary: "Get all plans",
    description: "Retrieves plans with pagination and filtering",
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
    name: "name",
    description: "Filter by plan name (partial match)",
    required: false,
    type: String,
  })
  @ApiQuery({
    name: "is_default",
    description: "Filter by default plan status",
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: "price_min",
    description: "Minimum price filter",
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: "price_max",
    description: "Maximum price filter",
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: "mcqs_min",
    description: "Minimum MCQs filter",
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: "mcqs_max",
    description: "Maximum MCQs filter",
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: "qrocs_min",
    description: "Minimum QROCs filter",
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: "qrocs_max",
    description: "Maximum QROCs filter",
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: "devices_min",
    description: "Minimum devices filter",
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: "devices_max",
    description: "Maximum devices filter",
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: "explanations",
    description: "Filter by explanations feature",
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: "notifications",
    description: "Filter by notifications feature",
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: "analysis",
    description: "Filter by analysis feature",
    required: false,
    type: Boolean,
  })
  @ApiQuery({
    name: "period",
    description: "Filter by billing period",
    required: false,
    enum: PlanPeriod,
  })
  @ApiOkResponse({
    description: "Plans fetched successfully",
  })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  async getPlansPaginated(
    @Query("name") name?: string,
    @Query("is_default", new ParseBoolPipe({ optional: true }))
    is_default?: boolean,
    @Query("price_min") price_min?: number,
    @Query("price_max") price_max?: number,
    @Query("mcqs_min") mcqs_min?: number,
    @Query("mcqs_max") mcqs_max?: number,
    @Query("qrocs_min") qrocs_min?: number,
    @Query("qrocs_max") qrocs_max?: number,
    @Query("devices_min") devices_min?: number,
    @Query("devices_max") devices_max?: number,
    @Query("explanations", new ParseBoolPipe({ optional: true }))
    explanations?: boolean,
    @Query("notifications", new ParseBoolPipe({ optional: true }))
    notifications?: boolean,
    @Query("analysis", new ParseBoolPipe({ optional: true }))
    analysis?: boolean,
    @Query("period", new ParseEnumPipe(PlanPeriod, { optional: true }))
    period?: PlanPeriod,
    @Query("page", new DefaultValuePipe(default_page), ParseIntPipe)
    page?: number,
    @Query("offset", new DefaultValuePipe(default_offset), ParseIntPipe)
    offset?: number,
  ): Promise<ResponseInterface<PaginatedResponse<Plan>>> {
    // Build filters object
    const filters: PlanFilters = {
      name,
      is_default,
      price_min,
      price_max,
      mcqs_min,
      mcqs_max,
      qrocs_min,
      qrocs_max,
      devices_min,
      devices_max,
      explanations,
      notifications,
      analysis,
      period,
    };
    const pagination: PaginationInterface = {
      page,
      offset,
    };
    const data = await this.planService.findPlansPaginated(filters, pagination);
    return {
      message: "Plans fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get("/default")
  @ApiOperation({
    summary: "Get default plan",
    description: "Retrieves the default subscription plan",
  })
  @ApiOkResponse({
    description: "Default plan fetched successfully",
  })
  @ApiNotFoundResponse({ description: "Default plan not found" })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  async getDefaultPlan() {
    const data = await this.planService.getDefaultPlan();
    return {
      message: "Default plan fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get("/:id")
  @ApiOperation({
    summary: "Get plan by ID",
    description: "Retrieves a specific plan by its ID",
  })
  @ApiParam({
    name: "id",
    description: "Plan ID (UUID)",
    required: true,
    type: String,
  })
  @ApiOkResponse({
    description: "Plan fetched successfully",
  })
  @ApiNotFoundResponse({ description: "Plan not found" })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  async getPlan(@Param("id", ParseUUIDPipe) id: string) {
    const data = await this.planService.getPlanById(id);
    return {
      message: "Plan fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Patch("/:id")
  @UseGuards(RolesGuard)
  @Roles(BaseRoles.ADMIN)
  @ApiOperation({
    summary: "Update plan",
    description: "Updates an existing plan. Requires admin role.",
  })
  @ApiParam({
    name: "id",
    description: "Plan ID (UUID)",
    required: true,
    type: String,
  })
  @ApiBody({ type: UpdatePlanDto, description: "Updated plan data" })
  @ApiOkResponse({
    description: "Plan updated successfully",
  })
  @ApiNotFoundResponse({ description: "Plan not found" })
  @ApiConflictResponse({
    description: "Plan name already exists or default plan already exists",
  })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiForbiddenResponse({ description: "Forbidden - requires admin role" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    const data = await this.planService.update(id, updatePlanDto);
    return {
      message: "Plan updated successfully",
      status: HttpStatus.OK,
    };
  }

  @Delete("/:id")
  @UseGuards(RolesGuard)
  @Roles(BaseRoles.ADMIN)
  @ApiOperation({
    summary: "Delete plan",
    description: "Removes a plan from the system. Requires admin role.",
  })
  @ApiParam({
    name: "id",
    description: "Plan ID (UUID)",
    required: true,
    type: String,
  })
  @ApiOkResponse({
    description: "Plan removed successfully",
  })
  @ApiNotFoundResponse({ description: "Plan not found" })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiForbiddenResponse({ description: "Forbidden - requires admin role" })
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    const data = await this.planService.remove(id);
    return {
      message: "Plan removed successfully",
      status: HttpStatus.OK,
    };
  }
}
