import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { UserService } from "src/user/services/user.service";
import { ValidatePasswordResetDto } from "../validate-password-reset.dto";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { RequestPasswordResetDto } from "../types/dtos/request-password-reset.dto";
import { AuthService } from "../auth.service";
import { SignupUserDto } from "src/user/types/dtos/create-user.dto";
import { JwtPayload } from "../types/interfaces/payload.interface";
import { Request, Response } from "express";
import { User } from "src/user/entities/user.entity";
import { GoogleUser } from "src/user/types/interfaces/google-user.interface";
import { getEnvOrFatal } from "common/utils/env.util";
import { ValidateUserEmailVerificationDto } from "../validate-email-verification.dto";
import { generateOTP } from "common/utils/crypto";
import { RedisService } from "src/redis/redis.service";
import { RedisKeys } from "common/utils/redis-keys.util";
import { hashString, verifyHash } from "common/utils/hashing";
import { extractClientInfo } from "common/utils/client-info.util";
import { RefreshTokenPayload } from "shared/interfaces/refresh-token-interface";
import { SigninUserDto } from "src/user/types/dtos/signin-user.dto";
import { UserProfileService } from "src/user/services/user-profile.service";

/**
 * Service responsible for handling user authentication operations
 * including signup, signin, password reset, and Google authentication.
 */
@Injectable()
export class AuthUserService {
  private readonly EMAIL_VERIFICATION_SECRET = getEnvOrFatal<string>(
    "EMAIL_VERIFICATION_SECRET",
  );

  /**
   * Routes that are allowed for users without complete verification
   * Each route is defined by itws URL pattern and HTTP method
   */
  private readonly allowedRoutes = [
    { url: /^\/user\/me$/, method: "GET" },
    { url: /^\/user\/profile$/, method: "POST" },
    { url: /^\/auth\/email\/verify$/, method: "POST" },
    { url: /^\/auth\/email\/request$/, method: "POST" },
    { url: /^\/auth\/user\/email\/verify$/, method: "POST" },
    { url: /^\/auth\/user\/email\/request$/, method: "GET" },
    { url: /^\/university$/, method: "GET" },
    { url: /^\/unit$/, method: "GET" },
    { url: /^\/mode$/, method: "GET" },
    { url: /^\/faculty$/, method: "GET" },
    { url: /^\/auth\/google$/, method: "GET" },
    { url: /^\/auth\/google\/callback$/, method: "GET" },
    { url: /^\/auth\/signup$/, method: "POST" },
    { url: /^\/auth\/signin$/, method: "POST" },
    { url: /^\/auth\/password\/request$/, method: "POST" },
    { url: /^\/auth\/password\/validate$/, method: "POST" },
    { url: /^\/auth\/user\/logout$/, method: "POST" },
  ];

  /**
   * Creates an instance of AuthUserService.
   *
   * @param userService - Service handling user-related operations
   * @param authService - Service handling general authentication operations
   */
  constructor(
    private readonly userService: UserService,
    private readonly userProfileService: UserProfileService,
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Registers a new user and generates authentication tokens.
   *
   * @param signupUserDto - Data transfer object containing user registration information
   * @returns Promise containing access and refresh tokens
   */
  async signupUser(signupUserDto: SignupUserDto, req: Request, res: Response) {
    const user = await this.userService.create(signupUserDto);
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: BaseRoles.USER,
    };
    const otp_code = await this.generateUserEmailVerificationToken(user);
    await this.userService.sendWelcomeEmail(user, otp_code);

    const client_info = await extractClientInfo(req);
    const tokens = await this.authService.signTokens(payload);
    await this.authService.createSafeSession(
      {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        clientInfo: client_info,
      },
      res,
    );
    return tokens.accessToken;
  }

  /**
   * Authenticates a user with email and password, generating tokens.
   *
   * @param signinUserDto - Data transfer object containing user login credentials
   * @param clientInfo - Information about the client making the request (IP, user agent)
   * @param res - Express response object for cookie handling
   * @returns Promise containing access and refresh tokens
   */
  async signinUser(signinUserDto: SigninUserDto, req: Request, res: Response) {
    const client_info = await extractClientInfo(req);
    const user = await this.userService.signin(signinUserDto, client_info);
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: BaseRoles.USER,
    };
    const tokens = await this.authService.signTokens(payload);
    await this.authService.createSafeSession(
      {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        clientInfo: client_info,
      },
      res,
    );
    return tokens.accessToken;
  }

  /**
   * Authenticates a user with Google OAuth and generates tokens.
   *
   * @param user - User entity from the database
   * @param req - Express request object
   * @param res - Express response object
   * @returns Promise containing access and refresh tokens
   */
  async signinUserWithGoogle(user: User, req: Request, res: Response) {
    const client_info = await extractClientInfo(req);
    const payload = { id: user.id, email: user.email, role: BaseRoles.USER };
    const tokens = await this.authService.signTokens(payload);
    await this.authService.createSafeSession(
      {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        clientInfo: client_info,
      },
      res,
    );
    return tokens;
  }

  /**
   * Initiates the password reset process for a user.
   * Generates a single-use token and triggers the reset notification.
   *
   * @param requestPasswordResetDto - DTO containing the user's email
   * @returns The generated reset token or null if the user is not found
   */
  async requestUserPasswordReset(
    requestPasswordResetDto: RequestPasswordResetDto,
  ) {
    const user = await this.userService.findUserByEmailWithPassword(
      requestPasswordResetDto.email,
    );
    if (!user) {
      return null;
    }
    const jwt_payload: JwtPayload = {
      id: user.id,
      email: user.email,
      role: BaseRoles.USER,
    };
    const token = await this.authService.signSingleUseToken(
      jwt_payload,
      user.password,
    );
    return this.userService.requestPasswordReset(user, token);
  }

  /**
   * Validates a password reset token and updates the user's password.
   *
   * @param validatePasswordResetCodeDto - DTO containing the reset token and new password
   * @returns True if the password was successfully reset
   * @throws BadRequestException if the token is invalid or the user is not found
   */
  async validateUserPasswordResetToken(
    validatePasswordResetCodeDto: ValidatePasswordResetDto,
  ) {
    const { token } = validatePasswordResetCodeDto;
    const decoded = await this.authService.decodeToken(token);
    if (!decoded || !decoded.id) {
      throw new BadRequestException("Invalid token");
    }
    const user = await this.userService.findUserByIdWithPassword(decoded.id);
    if (!user) {
      throw new BadRequestException("Invalid token");
    }
    await this.authService.validateSingleUseToken(token, user.password);
    return this.userService.updateUserPasswordById(
      user.id,
      validatePasswordResetCodeDto.password,
    );
  }

  /**
   * Generates an email verification token for a user.
   *
   * This method creates a one-time password (OTP) and stores its hashed value in Redis
   * with an expiration of 600 seconds (10 minutes). It then generates a JWT token
   * containing the user's ID, email, role, and the OTP code.
   *
   * @param user - The user for whom to generate the email verification token
   * @returns A Promise that resolves to the signed single-use JWT token
   */
  async generateUserEmailVerificationToken(user: User) {
    const code = generateOTP();
    await this.redisService.set(
      RedisKeys.getRedisEmailVerification(user.id),
      await hashString(code),
      600,
    );
    // const jwt_payload = {
    //   id: user.id,
    //   email: user.email,
    //   role: BaseRoles.USER,
    //   code,
    // };
    // return this.authService.signSingleUseToken(
    //   jwt_payload,
    //   this.EMAIL_VERIFICATION_SECRET,
    // );
    return code;
  }
  /**
   * Initiates the email verification process for a user.
   *
   * @param userId  - The unique identifier of the user requesting email verification
   * @param user  -   The the user requesting email verification
   * @returns A Promise that resolves when the verification email has been sent
   * @throws {ConflictException} If the user's email is already verified
   * @throws {NotFoundException} If no user is found with the provided ID (thrown by userService.getUserById)
   */
  async requestUserEmailVerification(userId: string) {
    const user = await this.userService.getUserById(userId);
    if (user.email_verified) {
      throw new ConflictException("Email already verfied");
    }
    const code = await this.generateUserEmailVerificationToken(user);
    return this.userService.sendEmailVerificationCode(user, code);
  }

  /**
   * Validates a user's email verification token.
   *
   * This method verifies the token provided in the DTO, decodes it to extract the user ID,
   * validates that the user exists, and checks if the token is valid for single use.
   * If all validations pass, it updates the user's email verification status to true.
   *
   * @param validateUserEmailVerificationDto - The DTO containing the email verification token
   * @returns A promise that resolves to the updated user with verified email status
   * @throws {BadRequestException} If the token is invalid or the user doesn't exist
   */
  async validateUserEmailVerificationToken(
    user: JwtPayload,
    validateUserEmailVerificationDto: ValidateUserEmailVerificationDto,
  ) {
    const { otp_code } = validateUserEmailVerificationDto;
    // const decoded = await this.authService.validateSingleUseToken(
    //   code,
    //   this.EMAIL_VERIFICATION_SECRET,
    // );
    // if (!decoded || !decoded.id || !decoded.code) {
    //   throw new BadRequestException("Invalid token");
    // }

    const user_obj = await this.userService.getUserById(user.id);
    if (!user_obj) {
      throw new BadRequestException("Invalid token");
    }
    if (user_obj.email_verified) {
      throw new ConflictException("Email already verified");
    }
    const hashed_code = await this.redisService.get(
      RedisKeys.getRedisEmailVerification(user_obj.id),
    );
    if (!hashed_code) {
      throw new BadRequestException("Token expired");
    }
    if (!(await verifyHash(otp_code.toString(), hashed_code))) {
      throw new BadRequestException("Invalid token");
    }
    await this.redisService.delete(
      RedisKeys.getRedisEmailVerification(user_obj.id),
    );
    return this.userService.updateEmailVerificationStatus(user_obj.id, true);
  }

  /**
   * Validates a user attempting to authenticate with Google OAuth.
   * Creates a new user if none exists with the Google account email.
   *
   * @param userDto - Google user information including email, name, and picture
   * @returns Promise containing the user entity
   */
  async validateUserWithGoogle(userDto: GoogleUser): Promise<User> {
    return this.userService.validateUserWithGoogle(userDto);
  }

  /**
   * validate user information to allow request to pass , based JWT payload.
   *
   * @param payload - JWT payload containing user id, email and role
   * @param req - Express request object
   * @returns Promise containing user information
   */
  async validateUser(payload: JwtPayload, req: Request) {
    if (!payload) {
      throw new BadRequestException("Invalid token");
    }
    const is_allowed_route = this.allowedRoutes.some(
      (route) => route.url.test(req.path) && req.method === route.method,
    );
    if (is_allowed_route) return true;
    const user_profile = await this.userProfileService.hasUserProfile(
      payload.id,
    );
    if (!user_profile) {
      throw new BadRequestException({
        message: "User profile not completed",
        profile_completed: false,
      });
    }
  }

  async logoutUser(userId: string, req: Request, res: Response) {
    return this.authService.deleteSafeSession(userId, req, res);
  }

  async refreshToken(req: Request, res: Response) {
    const { refreshToken, iat, exp, ...payload } =
      req.user as RefreshTokenPayload;
    const client_info = await extractClientInfo(req);
    const hashed_refresh_token = await this.authService.validateUserSession(
      { clientInfo: client_info },
      req,
    );
    if (
      !hashed_refresh_token ||
      !(await verifyHash(refreshToken, hashed_refresh_token))
    ) {
      throw new BadRequestException("Invalid refresh token");
    }
    return this.authService.generateAccessToken(payload);
  }
}
