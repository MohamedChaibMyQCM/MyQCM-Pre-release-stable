import { Controller, Get, HttpStatus, UseGuards } from "@nestjs/common";
import { UserStreakService } from "../services/user-streak.service";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { Roles } from "common/decorators/auth/roles.decorator";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

@ApiTags("User Streak")
@ApiBearerAuth()
@Controller("/user/streak")
export class UserStreakController {
  constructor(private readonly userStreakService: UserStreakService) {}

  @Get("/me")
  @ApiOperation({
    summary: "Get user streak",
    description: "Retrieves the authenticated user's current streak.",
  })
  @ApiResponse({
    status: 200,
    description: "User streak retrieved successfully.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.USER)
  async getStreak(@GetUser() user: JwtPayload) {
    const data = await this.userStreakService.getAuthenticatedUserStreak(
      user.id,
    );
    return {
      message: "User streak retrieved successfully",
      status: HttpStatus.OK,
      data,
    };
  }
}
