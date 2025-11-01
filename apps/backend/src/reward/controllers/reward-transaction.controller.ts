import {
  Controller,
  Get,
  HttpStatus,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RewardTransactionService } from "../services/reward-transaction.service";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { Roles } from "common/decorators/auth/roles.decorator";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";

@ApiTags("Reward Transactions")
@Controller("reward/transactions")
@UseGuards(AccessTokenGuard, RolesGuard)
export class RewardTransactionController {
  constructor(
    private readonly rewardTransactionService: RewardTransactionService,
  ) {}

  @Get("/me")
  @Roles(BaseRoles.USER, BaseRoles.ADMIN)
  async findForCurrentUser( 
    @GetUser() user: JwtPayload,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    const parsedLimit = limit
      ? Math.min(Math.max(parseInt(limit, 10) || 25, 1), 100)
      : 25;
    const parsedOffset = offset
      ? Math.max(parseInt(offset, 10) || 0, 0)
      : 0;

    const data = await this.rewardTransactionService.findUserTransactions(
      user.id,
      {
        limit: parsedLimit,
        offset: parsedOffset,
      },
    );

    return {
      status: HttpStatus.OK,
      message: "Reward transactions fetched successfully",
      data,
    };
  }
}
