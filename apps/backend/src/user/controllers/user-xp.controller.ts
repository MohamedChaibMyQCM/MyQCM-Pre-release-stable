import { Controller, Get, HttpStatus, UseGuards } from "@nestjs/common";
import { UserXpService } from "../services/user-xp.service";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { Roles } from "common/decorators/auth/roles.decorator";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { ResponseInterface } from "shared/interfaces/response.interface";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from "@nestjs/swagger";

/**
 * Controller for handling user experience points related endpoints
 */
@ApiTags("User Experience")
@ApiBearerAuth()
@Controller("/user/xp")
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(BaseRoles.USER)
export class UserXpController {
  constructor(private readonly userXpService: UserXpService) {}

  /**
   * Retrieves the current user's XP information
   */
  @Get("/me")
  @ApiOperation({
    summary: "Get current authenticated user XP",
    description:
      "Retrieves experience points information for the authenticated user",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User XP retrieved successfully",
    type: Object,
  })
  @ApiUnauthorizedResponse({ description: "User is not authenticated" })
  @ApiForbiddenResponse({ description: "User does not have the required role" })
  async getUserXP(
    @GetUser() user: JwtPayload,
  ): Promise<ResponseInterface<any>> {
    const data = await this.userXpService.getUserXpWithLevel(user.id, {
      include_level: true,
      include_rank: true,
    });
    return {
      message: "User XP retrieved successfully",
      status: HttpStatus.OK,
      data,
    };
  }
}
