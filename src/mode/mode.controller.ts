import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
  ParseEnumPipe,
} from "@nestjs/common";
import { ModeService } from "./mode.service";
import { CreateModeDto } from "./types/dtos/create-mode.dto";
import { UpdateModeDto } from "./types/dtos/update-mode.dto";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { Mode } from "./entities/mode.entity";
import { PaginatedResponse } from "shared/interfaces/paginated.response.interface";
import { ModeFilters } from "./types/interfaces/mode-filter.interface";
import { ModeDefiner } from "./types/enums/mode-definier.enum";
import { default_offset, default_page } from "shared/constants/pagination";
import { ResponseInterface } from "shared/interfaces/response.interface";

/**
 * Controller for managing Mode entities
 * Handles CRUD operations for modes with authentication
 */
@ApiTags("Modes")
@ApiBearerAuth()
@Controller("mode")
@UseGuards(AccessTokenGuard)
export class ModeController {
  constructor(private readonly modeService: ModeService) {}

  /**
   * Create a new mode
   */
  @Post()
  @ApiOperation({ summary: "Create a new mode" })
  @ApiBody({ type: CreateModeDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "The mode has been successfully created.",
    type: Mode,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input data.",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Unauthorized.",
  })
  async create(
    @Body() createModeDto: CreateModeDto,
  ): Promise<ResponseInterface<null>> {
    const data = await this.modeService.createNewMode(createModeDto);
    return {
      message: "Mode created succesfully",
      status: HttpStatus.CREATED,
    };
  }

  /**
   * Get all modes with optional filtering and pagination
   */
  @Get()
  @ApiOperation({
    summary: "Get all modes with optional filtering and pagination",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (starts from 1)",
  })
  @ApiQuery({
    name: "offset",
    required: false,
    type: Number,
    description: "Number of items per page",
  })
  @ApiQuery({
    name: "name",
    required: false,
    type: String,
    description: "Filter modes by name (partial match)",
  })
  @ApiQuery({
    name: "include_qcm_definer",
    required: false,
    enum: ModeDefiner,
    description: "Filter by QCM definer setting",
  })
  @ApiQuery({
    name: "include_qcs_definer",
    required: false,
    enum: ModeDefiner,
    description: "Filter by QCS definer setting",
  })
  @ApiQuery({
    name: "include_qroc_definer",
    required: false,
    enum: ModeDefiner,
    description: "Filter by QROC definer setting",
  })
  @ApiQuery({
    name: "time_limit_definer",
    required: false,
    enum: ModeDefiner,
    description: "Filter by time limit definer setting",
  })
  @ApiQuery({
    name: "number_of_questions_definer",
    required: false,
    enum: ModeDefiner,
    description: "Filter by number of questions definer setting",
  })
  @ApiQuery({
    name: "randomize_questions_order_definer",
    required: false,
    enum: ModeDefiner,
    description: "Filter by randomize questions order definer setting",
  })
  @ApiQuery({
    name: "randomize_options_order_definer",
    required: false,
    enum: ModeDefiner,
    description: "Filter by randomize options order definer setting",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "List of modes retrieved successfully",
    type: Object,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Unauthorized.",
  })
  async findAll(
    @Query("name") name?: string,
    @Query(
      "include_qcm_definer",
      new ParseEnumPipe(ModeDefiner, { optional: true }),
    )
    include_qcm_definer?: ModeDefiner,
    @Query(
      "include_qcs_definer",
      new ParseEnumPipe(ModeDefiner, { optional: true }),
    )
    include_qcs_definer?: ModeDefiner,
    @Query(
      "include_qroc_definer",
      new ParseEnumPipe(ModeDefiner, { optional: true }),
    )
    include_qroc_definer?: ModeDefiner,
    @Query(
      "time_limit_definer",
      new ParseEnumPipe(ModeDefiner, { optional: true }),
    )
    time_limit_definer?: ModeDefiner,
    @Query(
      "number_of_questions_definer",
      new ParseEnumPipe(ModeDefiner, { optional: true }),
    )
    number_of_questions_definer?: ModeDefiner,
    @Query(
      "randomize_questions_order_definer",
      new ParseEnumPipe(ModeDefiner, { optional: true }),
    )
    randomize_questions_order_definer?: ModeDefiner,
    @Query(
      "randomize_options_order_definer",
      new ParseEnumPipe(ModeDefiner, { optional: true }),
    )
    randomize_options_order_definer?: ModeDefiner,
    @Query("page", new DefaultValuePipe(default_page), ParseIntPipe)
    page?: number,
    @Query("offset", new DefaultValuePipe(default_offset), ParseIntPipe)
    offset?: number,
  ): Promise<ResponseInterface<PaginatedResponse<Mode>>> {
    const filters: ModeFilters = {
      name,
      include_qcm_definer,
      include_qcs_definer,
      include_qroc_definer,
      time_limit_definer,
      number_of_questions_definer,
      randomize_questions_order_definer,
      randomize_options_order_definer,
    };

    // Remove undefined values
    Object.keys(filters).forEach(
      (key) => filters[key] === undefined && delete filters[key],
    );

    const data = await this.modeService.findModesPaginated(filters, {
      page: page || 1,
      offset: offset || 10,
    });
    return {
      message: "Modes retreived succesfully",
      status: HttpStatus.OK,
      data,
    };
  }

  /**
   * Get a mode by ID
   */
  @Get(":id")
  @ApiOperation({ summary: "Get a mode by ID" })
  @ApiParam({ name: "id", description: "Mode ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Mode retrieved successfully",
    type: Mode,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Mode not found.",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Unauthorized.",
  })
  async findOne(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ResponseInterface<Mode>> {
    const data = await this.modeService.getModeById(id);
    return {
      message: "Mode retreived succesfully",
      status: HttpStatus.OK,
      data,
    };
  }

  /**
   * Update a mode by ID
   */
  @Patch(":id")
  @ApiOperation({ summary: "Update a mode by ID" })
  @ApiParam({ name: "id", description: "Mode ID" })
  @ApiBody({ type: UpdateModeDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Mode updated successfully",
    type: Boolean,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Mode not found.",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input data.",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Unauthorized.",
  })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateModeDto: UpdateModeDto,
  ): Promise<ResponseInterface<null>> {
    const data = await this.modeService.update(id, updateModeDto);
    return {
      message: "Mode updated succesfully",
      status: HttpStatus.OK,
    };
  }

  /**
   * Delete a mode by ID
   */
  @Delete(":id")
  @ApiOperation({ summary: "Delete a mode by ID" })
  @ApiParam({ name: "id", description: "Mode ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Mode deleted successfully",
    type: Boolean,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Mode not found.",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Cannot delete the default mode.",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Unauthorized.",
  })
  async remove(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ResponseInterface<null>> {
    const data = await this.modeService.remove(id);
    return {
      message: "Mode deleted succesfully",
      status: HttpStatus.OK,
    };
  }
}
