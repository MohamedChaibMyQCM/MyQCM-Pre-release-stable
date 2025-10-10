// notification.controller.ts
import {
  Controller,
  Sse,
  Get,
  Param,
  Post,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  HttpStatus,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Body,
  HttpCode, // Import HttpCode for setting response status explicitly
} from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { User } from "src/user/entities/user.entity";
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { default_offset, default_page } from "shared/constants/pagination";
import { ResponseInterface } from "shared/interfaces/response.interface";
import { PaginatedResponse } from "shared/interfaces/paginated.response.interface";
import { Notification } from "./entities/notification.entity";
import { NotificationType } from "./types/enums/notification-type.enum";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";
import { CreateNotificationDto } from "./types/dtos/create-notification.dto";
import { ChangeNotificationStatusDto } from "./types/dtos/change-notification-status.dto";
import { NotificationStatus } from "./types/enums/notification-status.enum";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { Roles } from "common/decorators/auth/roles.decorator";
import { BaseRoles } from "shared/enums/base-roles.enum";

@ApiTags("Notifications")
@Controller("notification")
@UseGuards(AccessTokenGuard , RolesGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({
    summary: "Get paginated notifications with filtering",
    description:
      "Retrieves notifications for the authenticated user with optional filtering, pagination, and sorting",
  })
  @ApiQuery({
    name: "page",
    description: "Page number for pagination",
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: "offset",
    description: "Number of items per page",
    required: false,
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: "is_read",
    description: "Filter by read status (true/false)",
    required: false,
    type: Boolean,
    example: false,
  })
  @ApiQuery({
    name: "type",
    description: "Filter by notification type",
    required: false,
    enum: NotificationType,
    enumName: "NotificationType",
    example: NotificationType.REMINDER,
  })
  @ApiResponse({
    status: 200,
    description: "Notifications retrieved successfully",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - User not authenticated",
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Invalid parameters",
  })
  @Get("/")
  async getUnreadNotifications(
    @GetUser() user: User,
    @Query("page", new DefaultValuePipe(default_page), ParseIntPipe)
    page?: number,
    @Query("offset", new DefaultValuePipe(default_offset), ParseIntPipe)
    offset?: number,
    @Query("is_read", new DefaultValuePipe(undefined))
    is_read?: boolean,
    @Query(
      "type",
      new DefaultValuePipe(undefined),
      new ParseEnumPipe(NotificationType, { optional: true }),
    )
    type?: NotificationType,
  ): Promise<ResponseInterface<PaginatedResponse<Notification>>> {
    const data =
      await this.notificationService.findNotificationsByUserIdPaginated(
        user.id,
        { is_read, notification_type: type },
        { page, offset },
      );
    return {
      message: "Notifications fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Sse("subscribe")
  @ApiOperation({ summary: "Subscribe to SSE notifications" })
  subscribe(@GetUser() user: User) {
    return this.notificationService.subscribe(user.id);
  }

  @Post("/")
  @ApiOperation({
    summary:
      "Create a notification (for testing purposes only, not meant for direct user creation)",
    description: "Send a notification to a specific user",
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Notification created successfully",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid request body",
  })
  async sendNotification(
    @GetUser() user: JwtPayload,
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<ResponseInterface<null>> {
    await this.notificationService.createNotification(
      user.id,
      createNotificationDto,
    );
    return {
      message: "Notification created",
      status: HttpStatus.CREATED,
    };
  }

  @Post("/broadcast")
  @Roles(BaseRoles.ADMIN)
  @HttpCode(HttpStatus.OK) // Return 200 OK for successful processing, even if no users were subscribed
  @ApiOperation({
    summary: "Send notification to all  users",
    description:
      "Broadcasts a notification to all users who have an active Server-Sent Events (SSE) connection. A separate notification record will be created for each subscribed user.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Notifications processed for all  users.",
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Failed to send notifications to some or all  users.",
  })
  async sendNotificationToAllUsers(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<ResponseInterface<null>> {
    const data =
      await this.notificationService.sendNotificationToAllUsers(
        createNotificationDto,
      );
      return {
        message: "Notifications sent to all subscribed users",
        status: HttpStatus.OK,
      };
  }

  @Get("/:id")
  @ApiOperation({
    summary: "Get notification by ID",
    description: "Retrieves a notification by its UUID",
  })
  @ApiParam({
    name: "id",
    description: "Notification UUID",
    type: String,
    format: "uuid",
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: "Notification retrieved successfully",
    type: Notification,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid notification ID format",
  })
  @ApiResponse({
    status: 404,
    description: "Notification not found",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  async getNotificationById(
    @Param("id", new ParseUUIDPipe()) id: string,
    @GetUser() user: User,
  ): Promise<ResponseInterface<Notification>> {
    const data = await this.notificationService.getNotification({
      notificationId: id,
      userId: user.id,
    });
    return {
      message: "Notification fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Patch("/:id/status")
  @ApiOperation({
    summary: "Toggle notification read status",
    description: "Toggles a notification between read and unread states",
  })
  @ApiParam({
    name: "id",
    description: "Notification UUID",
    type: String,
    format: "uuid",
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: "Notification status toggled successfully",
    type: Notification,
  })
  @ApiResponse({
    status: 400,
    description: "Invalid notification ID format",
  })
  @ApiResponse({
    status: 404,
    description: "Notification not found",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
  })
  async changeNotificationStatus(
    @Param("id", new ParseUUIDPipe()) id: string,
    @GetUser() user: User,
    @Body() changeNotificationStatusDto: ChangeNotificationStatusDto,
  ): Promise<ResponseInterface<null>> {
    await this.notificationService.changeNotificationStatus(
      {
        notificationId: id,
        userId: user.id,
      },
      changeNotificationStatusDto.status as unknown as NotificationStatus,
    );
    return {
      message: `Notification read status changed to ${changeNotificationStatusDto.status}`,
      status: HttpStatus.OK,
    };
  }
}
