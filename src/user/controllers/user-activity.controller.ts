import { Controller, Get, HttpStatus, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { UserActivityService } from "../services/user-activity.service";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { Roles } from "common/decorators/auth/roles.decorator";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";
import { ResponseInterface } from "shared/interfaces/response.interface";
import { UserActivity } from "../entities/user-activity.entity";

@ApiTags("User Activity")
@ApiBearerAuth()
@Controller("/user/activity")
export class UserActivityController {
  constructor(private readonly userActivityService: UserActivityService) {}

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.USER)
  @Get("/me")
  @ApiOperation({ summary: "Get authenticated user's weekly activity" })
  @ApiResponse({
    status: 201,
    description: "User activity fetched successfully",
    type: Object,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async getAuthenticatedUserActivities(
    @GetUser() user: JwtPayload,
  ): Promise<ResponseInterface<Record<string, UserActivity[]>>> {
    const data = await this.userActivityService.getUserThisWeekActivities(
      user.id,
    );
    return {
      message: "User this week activities fetched successfully",
      status: HttpStatus.CREATED,
      data,
    };
  }
}
