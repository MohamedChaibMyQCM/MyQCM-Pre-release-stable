import { Controller, Get, HttpStatus, UseGuards } from "@nestjs/common";
import { UserSubscriptionService } from "../services/user-subscription.service";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { Roles } from "common/decorators/auth/roles.decorator";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";

@Controller("/user/subscription")
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles()
export class UserSubscriptionController {
  constructor(
    private readonly userSubscriptionService: UserSubscriptionService,
  ) {}
  @Get("/me")
  async getAuthenticatedUserSubscription(@GetUser() user: JwtPayload) {
    const data = await this.userSubscriptionService.findUserCurrentSubscription(
      user.id,
    );
    return {
      message: "User subscription fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }
}
