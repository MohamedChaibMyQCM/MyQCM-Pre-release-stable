import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiBody,
  ApiResponse,
} from "@nestjs/swagger";
import { AuthUserService } from "src/auth/services/auth-user.service";
import { SignupUserDto } from "src/user/types/dtos/create-user.dto";
import { GoogleAuthGuard } from "common/guards/auth/google-auth.guard";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { User } from "src/user/entities/user.entity";
import { Request, Response } from "express";
import { RequestPasswordResetDto } from "../types/dtos/request-password-reset.dto";
import { ValidatePasswordResetDto } from "../validate-password-reset.dto";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { Roles } from "common/decorators/auth/roles.decorator";
import { JwtPayload } from "../types/interfaces/payload.interface";
import { ValidateUserEmailVerificationDto } from "../validate-email-verification.dto";
import { RefreshTokenGuard } from "common/guards/auth/refresh-token.guard";
import { SigninUserDto } from "src/user/types/dtos/signin-user.dto";
import { createGoogleAuthRedirectLink } from "common/utils/url.util";

@ApiTags("User Auth")
@Controller("/auth/user")
export class AuthUserController {
  constructor(private readonly authUserService: AuthUserService) {}

  @Post("/signup")
  @ApiOperation({
    summary: "Create a new user and send email verification code",
  })
  @ApiBody({ type: SignupUserDto })
  @ApiCreatedResponse({ description: "User successfully created" })
  @ApiBadRequestResponse({ description: "Invalid input data" })
  async signupUser(
    @Body() createUserDto: SignupUserDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authUserService.signupUser(
      createUserDto,
      req,
      res,
    );
    return {
      message: "User created successfully",
      status: HttpStatus.CREATED,
      token,
    };
  }

  @Post("/signin")
  @ApiOperation({ summary: "Sign in user and get token" })
  @ApiBody({ type: SigninUserDto })
  @ApiCreatedResponse({ description: "User successfully authenticated" })
  @ApiBadRequestResponse({ description: "Invalid credentials" })
  @ApiUnauthorizedResponse({ description: "Authentication failed" })
  async signin(
    @Body() signinUserDto: SigninUserDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authUserService.signinUser(
      signinUserDto,
      req,
      res,
    );
    return {
      message: "User signed in successfully",
      status: HttpStatus.CREATED,
      token,
    };
  }

  @Post("/forgot-password/request")
  @ApiOperation({
    summary: "Request password reset (send reset token to email)",
  })
  @ApiBody({ type: RequestPasswordResetDto })
  @ApiCreatedResponse({ description: "Reset email sent if account exists" })
  @ApiBadRequestResponse({ description: "Invalid email format" })
  async requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ) {
    await this.authUserService.requestUserPasswordReset(
      requestPasswordResetDto,
    );
    return {
      message:
        "If the email is linked to an account, a reset token has been sent.",
      status: HttpStatus.CREATED,
    };
  }

  @Post("/forgot-password/reset")
  @ApiOperation({ summary: "Reset password with reset token" })
  @ApiBody({ type: ValidatePasswordResetDto })
  @ApiCreatedResponse({ description: "Password successfully reset" })
  @ApiBadRequestResponse({ description: "Invalid token or password format" })
  @ApiUnauthorizedResponse({ description: "Token expired or invalid" })
  async resetPassword(
    @Body() validatePasswordResetDto: ValidatePasswordResetDto,
  ) {
    await this.authUserService.validateUserPasswordResetToken(
      validatePasswordResetDto,
    );
    return {
      message: "Password reset successfully",
      status: HttpStatus.CREATED,
    };
  }

  @Get("/email/request")
  @ApiOperation({ summary: "Send email confirmation code if not verified" })
  @ApiResponse({ status: 201, description: "Email verification code sent" })
  @ApiResponse({ status: 400, description: "Email already verified" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.USER)
  async requestUserEmailVerification(@GetUser() user: JwtPayload) {
    const data = await this.authUserService.requestUserEmailVerification(
      user.id,
    );
    return {
      message: "Email verification was sent successfully",
      status: HttpStatus.CREATED,
    };
  }

  @Post("/email/verify")
  @ApiOperation({ summary: "Verify email with confirmation code" })
  @ApiBody({
    type: ValidateUserEmailVerificationDto,
    description: "Verification code",
  })
  @ApiResponse({ status: 201, description: "Email verified successfully" })
  @ApiResponse({ status: 400, description: "Invalid verification code" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.USER)
  async verifyEmail(
    @Body() validateUserEmailVerificationDto: ValidateUserEmailVerificationDto,
    @GetUser() user: JwtPayload,
  ) {
    await this.authUserService.validateUserEmailVerificationToken(
      user,
      validateUserEmailVerificationDto,
    );
    return {
      message: "Email verified successfully",
      status: HttpStatus.CREATED,
    };
  }

  @Get("/google")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Initiate Google OAuth authentication" })
  @ApiOkResponse({ description: "Redirects to Google authentication" })
  googleLogin() {}

  @Get("/google/callback")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Google OAuth callback handler" })
  @ApiOkResponse({ description: "Redirects to client with access token" })
  @ApiUnauthorizedResponse({ description: "Google authentication failed" })
  async googleLoginRedirect(
    @GetUser() user: User,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const tokens = await this.authUserService.signinUserWithGoogle(
      user,
      req,
      res,
    );
    return res.redirect(
      createGoogleAuthRedirectLink({
        token: tokens.accessToken,
      }),
    );
  }
  @Post("/logout")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.USER)
  @ApiOperation({ summary: "Logout user" })
  @ApiOkResponse({ description: "User logged out successfully" })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  async logout(
    @GetUser() user: JwtPayload,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.authUserService.logoutUser(user.id, req, res);
    return {
      message: "User logged out successfully",
      status: HttpStatus.OK,
    };
  }

  @Get("/refresh")
  @UseGuards(RefreshTokenGuard, RolesGuard)
  @Roles(BaseRoles.USER)
  @ApiOperation({ summary: "Refresh access token" })
  @ApiOkResponse({ description: "Token refreshed successfully" })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authUserService.refreshToken(req, res);
    return {
      message: "Token refreshed successfully",
      status: HttpStatus.OK,
      token,
    };
  }
}
