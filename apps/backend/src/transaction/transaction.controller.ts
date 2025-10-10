import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
  Patch,
  Query,
} from "@nestjs/common";
import { TransactionService } from "./transaction.service";
import { CreateWithdrawTransactionDto } from "./dto/create-transaction.dto";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { Roles } from "common/decorators/auth/roles.decorator";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { UpdateTransactionStatus } from "./dto/update-transaction.dto";
import { Freelancer } from "src/freelancer/entities/freelancer.entity";
@ApiTags("Transaction")
@Controller("transaction")
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post("/withdraw")
  @ApiOperation({ summary: "create new money withdraw request" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER)
  async createWithdrawTransaction(
    @Body() createWithdrawTransactionDto: CreateWithdrawTransactionDto,
    @GetUser() freelancer: Freelancer,
  ) {
    const data = await this.transactionService.createWithdrawTransaction(
      freelancer,
      createWithdrawTransactionDto,
    );
    return {
      message: "Withdraw request created successfully",
      status: HttpStatus.CREATED,
      data,
    };
  }

  @Get()
  @ApiOperation({ summary: "get all freelancer transactions" })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "page", required: false })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER)
  async findAll(
    @GetUser() freelancer: Freelancer,

    @Query("limit") limit: number,
    @Query("page") page: number,
  ) {
    const data = await this.transactionService.findAll(freelancer, page, limit);
    return {
      message: "Freelancer transactions fetched successfully",
      status: HttpStatus.CREATED,
      data,
    };
  }
  @Get("/all")
  @ApiOperation({
    summary: "get all pending withdrawl transactions for admin to review",
  })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "page", required: false })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  async findAllPendingWithdrawal(
    @Query("limit") limit: number,
    @Query("page") page: number,
  ) {
    const data = await this.transactionService.findAllPendingWithdrawal(
      page,
      limit,
    );
    return {
      message: "Pending withdrawal transactions fetched successfully",
      status: HttpStatus.CREATED,
      data,
    };
  }
  @Get("/:transactionId")
  @ApiOperation({
    summary:
      "get freelancer transaction by transactionId (return not found if not found or the freelancer is not transaction owner)",
  })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.FREELANCER)
  async findOne(
    @Param("transactionId", new ParseUUIDPipe()) transactionId: string,
    @GetUser() freelancer: Freelancer,
  ) {
    const data = await this.transactionService.findOne(
      transactionId,
      freelancer,
    );
    return {
      message: "Freelancer transactions fetched successfully",
      status: HttpStatus.CREATED,
      data,
    };
  }
  @Patch("/:transactionId")
  @ApiOperation({
    summary: "update transaction status by transactionId for admin only",
  })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  async updateTransactionStatus(
    @Param("transactionId", new ParseUUIDPipe()) transactionId: string,
    @Body() updateTransactionStatus: UpdateTransactionStatus,
  ) {
    const data = await this.transactionService.updateTransactionStatus(
      transactionId,
      updateTransactionStatus,
    );
    return {
      message: "Transaction status updated successfully",
      status: HttpStatus.CREATED,
      data,
    };
  }
}
