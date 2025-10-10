import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  HttpStatus,
} from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { Request, Response } from "express";
import { CreatePaymentDto } from "./types/dtos/create-payment.dto";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { Roles } from "common/decorators/auth/roles.decorator";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiExcludeEndpoint,
} from "@nestjs/swagger";

/**
 * Controller for managing payment processing operations
 */
@ApiTags("Payment")
@Controller("payment")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post("/checkout")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.USER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Create a checkout session",
    description:
      "Creates a Chargily checkout session for a user to purchase a subscription plan",
  })
  @ApiBody({
    type: CreatePaymentDto,
    description: "Payment creation data containing the plan ID to purchase",
  })
  @ApiCreatedResponse({
    description:
      "Checkout session created successfully. User will be redirected to payment page.",
  })
  @ApiUnauthorizedResponse({ description: "User is not authenticated" })
  @ApiForbiddenResponse({ description: "User does not have the required role" })
  @ApiConflictResponse({
    description:
      "User already has an active subscription or is trying to pay for a default plan",
  })
  @ApiNotFoundResponse({ description: "The specified plan was not found" })
  @ApiInternalServerErrorResponse({
    description: "An error occurred while processing the request",
  })
  async createCheckout(
    @Res() res: Response,
    @Body() createPaymentDto: CreatePaymentDto,
    @GetUser() user: JwtPayload,
  ) {
    return false;
    //DEACTIVATED FOR NOW
    const data = await this.paymentService.createCheckout(
      user,
      createPaymentDto,
      res,
    );
    return {
      message: "Checkout was created successfully for user",
      status: HttpStatus.OK,
      data,
    };
  }

  /**
   * Handles incoming webhook events from Chargily payment gateway
   * @param req - Express request object containing webhook data
   * @param res - Express response object
   * @returns Confirmation of webhook processing
   */
  @Post("/webhook")
  @ApiExcludeEndpoint()
  async handleWebhook(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.paymentService.handleWebhook(req, res);
  }
}
