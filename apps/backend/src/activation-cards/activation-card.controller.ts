import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpStatus,
  UseGuards,
  Query,
  ParseBoolPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from "@nestjs/common";
import { CreateActivationCardDto } from "./types/dtos/create-activation-card.dto";
import { UpdateActivationCardDto } from "./types/dtos/update-activation-card.dto";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ActivationCard } from "./entities/activation-card.entity";
import { default_offset, default_page } from "shared/constants/pagination";
import { ActivationCardService } from "./activation-card.service";
import { ResponseInterface } from "shared/interfaces/response.interface";
import { PaginatedResponse } from "shared/interfaces/paginated.response.interface";
import { ConsumeActivationCardDto } from "./types/dtos/consume-activation-card.dto";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { Roles } from "common/decorators/auth/roles.decorator";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";
import { ParseDatePipe } from "common/pipes/parse-date.pipe";
import { UserSubscription } from "src/user/entities/user-subscription.entity";

@ApiTags("Activation Cards")
@ApiBearerAuth()
@Controller("activation-card")
@UseGuards(AccessTokenGuard)
export class ActivationCardController {
  constructor(private readonly activationCardService: ActivationCardService) {}

  /**
   * Create a new activation card
   */
  @ApiOperation({ summary: "Create a new activation card" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Activation Card created successfully",
    type: ActivationCard,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid data provided",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "User not authenticated",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "User not authorized",
  })
  @Post()
  @UseGuards(RolesGuard)
  @Roles(BaseRoles.ADMIN)
  async createNewActivationCard(
    @Body() createActivationCardDto: CreateActivationCardDto,
  ): Promise<ResponseInterface<ActivationCard>> {
    const data = await this.activationCardService.createNewActivationCard(
      createActivationCardDto,
    );
    return {
      message: "Activation Card created successfully",
      status: HttpStatus.CREATED,
      data,
    };
  }

  /**
   * Consume (redeem) an activation card
   */
  @ApiOperation({ summary: "Consume/redeem an activation card" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Activation card redeemed successfully",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid code, already redeemed, or expired",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "User not authenticated",
  })
  @Post("/consume")
  @UseGuards(RolesGuard)
  @Roles(BaseRoles.USER)
  async consume(
    @GetUser() user: JwtPayload,
    @Body() consumeActivationCardDto: ConsumeActivationCardDto,
  ): Promise<ResponseInterface<UserSubscription>> {
    const data = await this.activationCardService.consumeActivationCard(
      user.id,
      consumeActivationCardDto,
    );
    return {
      message: "Activation Card redeemed successfully",
      status: HttpStatus.OK,
      data,
    };
  }
  /**
   * Get a paginated list of activation cards with optional filters
   */
  @ApiOperation({
    summary: "Get all activation cards with pagination and filtering",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "List of activation cards",
    type: ActivationCard,
    isArray: true,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "User not authenticated",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "User not authorized",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid parameters",
  })
  @ApiQuery({
    name: "is_redeemed",
    required: false,
    type: Boolean,
    description: "Filter by redemption status",
  })
  @ApiQuery({
    name: "plan",
    required: false,
    type: String,
    description: "Filter by plan ID",
  })
  @ApiQuery({
    name: "redeemed_by",
    required: false,
    type: String,
    description: "Filter by user ID who redeemed",
  })
  @ApiQuery({
    name: "redeemed_at",
    required: false,
    type: String,
    description: "Filter by redeemed date (ISO format or range)",
  })
  @ApiQuery({
    name: "expires_at",
    required: false,
    type: String,
    description: "Filter by expiration date",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Pagination - Page number",
    example: 1,
  })
  @ApiQuery({
    name: "offset",
    required: false,
    type: Number,
    description: "Pagination - Items per page",
    example: 10,
  })
  @Get()
  @UseGuards(RolesGuard)
  @Roles(BaseRoles.ADMIN)
  async findAllActivationCardsPaginated(
    @Query("is_redeemed", new ParseBoolPipe({ optional: true }))
    is_redeemed?: boolean,
    @Query("plan", new ParseUUIDPipe({ optional: true })) plan?: string,
    @Query("redeemed_by", new ParseUUIDPipe({ optional: true }))
    redeemed_by?: string,
    @Query("redeemed_at", ParseDatePipe) redeemed_at?: Date,
    @Query("expires_at", ParseDatePipe) expires_at?: Date,
    @Query("page", new DefaultValuePipe(default_page), ParseIntPipe)
    page?: number,
    @Query("offset", new DefaultValuePipe(default_offset), ParseIntPipe)
    offset?: number,
  ): Promise<ResponseInterface<PaginatedResponse<ActivationCard>>> {
    const data =
      await this.activationCardService.findAllActivationCardsPaginated(
        {
          is_redeemed,
          plan,
          redeemed_by,
          redeemed_at,
          expires_at,
        },
        {
          page,
          offset,
        },
      );
    return {
      message: "Activation Cards fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  /**
   * Get a specific activation card by ID
   */
  @ApiOperation({ summary: "Get activation card by ID" })
  @ApiParam({
    name: "id",
    description: "Activation card ID (UUID)",
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Activation card details",
    type: ActivationCard,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Activation card not found",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid UUID format",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "User not authenticated",
  })
  @Get("/:id")
  @UseGuards(RolesGuard)
  @Roles(BaseRoles.ADMIN)
  async findOne(
    @Param("id", new ParseUUIDPipe()) id: string,
  ): Promise<ResponseInterface<ActivationCard>> {
    const data = await this.activationCardService.findOne(id, true);
    return {
      message: "Activation Card fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  /**
   * Update an activation card
   */
  @ApiOperation({ summary: "Update an activation card" })
  @ApiParam({
    name: "id",
    description: "Activation card ID (UUID)",
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Activation card updated successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Activation card not found",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid data or UUID format",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "User not authenticated",
  })
  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles(BaseRoles.ADMIN)
  async update(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() updateActivationCardDto: UpdateActivationCardDto,
  ): Promise<ResponseInterface<boolean>> {
    const data = await this.activationCardService.update(
      id,
      updateActivationCardDto,
    );
    return {
      message: "Activation Card updated successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  /**
   * Delete an activation card
   */
  @ApiOperation({ summary: "Delete an activation card" })
  @ApiParam({
    name: "id",
    description: "Activation card ID (UUID)",
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Activation card deleted successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Activation card not found",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid UUID format",
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "User not authenticated",
  })
  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(BaseRoles.ADMIN)
  async remove(
    @Param("id", new ParseUUIDPipe()) id: string,
  ): Promise<ResponseInterface<boolean>> {
    const data = await this.activationCardService.remove(id);
    return {
      message: "Activation Card deleted successfully",
      status: HttpStatus.OK,
      data,
    };
  }
}
