import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Put,
  UseGuards,
} from "@nestjs/common";
import { UserNotificationSettingsService } from "../services/user-notification-settings.service";
import {
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
} from "@nestjs/swagger";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { Roles } from "common/decorators/auth/roles.decorator";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { ToggleNotificationSettingDto } from "../types/dtos/toggle-notification-setting.dto";
import { ResponseInterface } from "shared/interfaces/response.interface";
import { UserNotificationSettings } from "../entities/user-notification-settings.entity";

@ApiTags("User Notification Settings")
@ApiBearerAuth()
@Controller("/user/notification-settings")
export class UserNotificationSettingsController {
  constructor(
    private readonly userNotificationSettingsService: UserNotificationSettingsService,
  ) {}

  @Get("/")
  @ApiOperation({
    summary: "Get user notification settings",
    description: "Fetches the authenticated user's notification preferences.",
  })
  @ApiResponse({
    status: 200,
    description: "User notification settings retrieved successfully.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 404,
    description: "User notification settings not found.",
  })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.USER)
  async getUserSettings(
    @GetUser() user: JwtPayload,
  ): Promise<ResponseInterface<UserNotificationSettings>> {
    const data =
      await this.userNotificationSettingsService.getAuthenticatedUserNotificationSettings(
        user.id,
      );
    return {
      message: "User notification settings fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Put("/toggle")
  @ApiOperation({
    summary: "Toggle notification setting (switch it state)",
    description:
      "Updates a specific notification preference for the authenticated user.",
  })
  @ApiResponse({
    status: 200,
    description: "Notification setting updated successfully.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({
    status: 404,
    description: "User notification settings not found.",
  })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.USER)
  async toggleSetting(
    @GetUser() user: JwtPayload,
    @Body() toggleDto: ToggleNotificationSettingDto,
  ): Promise<ResponseInterface<UserNotificationSettings>> {
    const data =
      await this.userNotificationSettingsService.toggleNotificationSetting(
        user.id,
        toggleDto,
      );
    return {
      message: "Notification setting updated successfully",
      status: HttpStatus.OK,
      data,
    };
  }
}
