import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { SignupUserDto } from "../types/dtos/create-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import { ILike, Repository } from "typeorm";
import { InjectQueue } from "@nestjs/bull";
import { randomBytes } from "crypto";
import { hashString, verifyHash } from "common/utils/hashing";
import { Queue } from "bull";
import { GoogleUser } from "../types/interfaces/google-user.interface";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";
import { NewLoginEmail } from "src/mail/types/new-login-email.interface";
import { format } from "date-fns";
import { ResetPasswordEmail } from "src/mail/types/reset-password-email.interafce";
import { getEnvOrFatal } from "common/utils/env.util";
import { ChangePasswordDto } from "../types/dtos/change-password.dto";
import { Request } from "express";
import { UserFilters } from "../types/interfaces/user-filters.interface";
import { ClientInfo } from "shared/interfaces/client-info.interface";
import { SigninUserDto } from "../types/dtos/signin-user.dto";
import { WelcomeEmail } from "src/mail/types/welcome-email.interface";
import { UpdateUserDto } from "../types/dtos/update-user.dto";
import {
  createEmailVerificationLink,
  createResetPasswordLink,
} from "common/utils/url.util";
import { EmailVerificationEmail } from "src/mail/types/email-verification-email.interface";
import { UserProfileService } from "./user-profile.service";

/**
 * Service responsible for user management operations.
 * Handles user authentication, registration, profile management, and related operations.
 * Manages email verification, password resets, and user plan subscriptions.
 */
@Injectable()
export class UserService {
  /**
   * Frontend URL for generating verification links
   */
  private readonly CLIENT_URL = getEnvOrFatal<string>("CLIENT_URL");

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectQueue("email-queue") private emailQueue: Queue,
    private readonly userProfileService: UserProfileService,
  ) {}

  /**
   * Retrieves a user based on JWT payload and validates access permissions
   *
   * @param payload - JWT payload containing user identity information
   * @param req - Express Request object for route validation
   * @returns Promise resolving to the user if authorized
   * @throws UnauthorizedException if user not found
   * @throws BadRequestException if user doesn't meet access requirements
   *
   * Note: This method appears to be commented out in the original code
   */
  async getUser(payload: JwtPayload, req?: Request) {
    /*const user = await this.userRepository.findOne({
      where: { id: payload.id },
    });
    if (!user) throw new UnauthorizedException("User not found");
    /*const is_allowed_route = this.allowedRoutes.some(
      (route) => route.url.test(req.path) && req.method === route.method
    );

    if (is_allowed_route) return user;
    if (!user.email_verified)
      throw new BadRequestException(`Email not verified`);
    if (!user.profile) throw new BadRequestException(`User profile not found`);
    if (!user.profile.university.has_access)
      throw new BadRequestException(
        "Sorry, your university does not have access yet"
      );
    return user;*/
  }

  /**
   * Checks if a user with the provided email already exists
   *
   * @param email - Email address to check
   * @returns Promise resolving to boolean indicating if email exists
   */
  async emailExists(email: string): Promise<Boolean> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ["id"],
    });
    return !!user;
  }

  /**
   * Finds a user by email including the password field (which is excluded by default)
   *
   * @param email - Email address to search for
   * @returns Promise resolving to user with password or null if not found
   */
  async findUserByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder("user")
      .where("user.email = :email", { email })
      .addSelect("user.password")
      .getOne();
  }

  /**
   * Finds a user by ID including the password field (which is excluded by default)
   *
   * @param id - User ID to search for
   * @returns Promise resolving to user with password or null if not found
   */
  async findUserByIdWithPassword(id: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder("user")
      .where("user.id = :id", { id })
      .addSelect("user.password")
      .getOne();
  }

  /**
   * Finds a user by ID without the password field
   *
   * @param id - User ID to search for
   * @returns Promise resolving to user or null if not found
   */
  async findUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  /**
   * Finds a user by email
   *
   * @param email - Email address to search for
   * @returns Promise resolving to user or null if not found
   */
  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        email,
      },
    });
  }
  /**
   * Gets a user by ID, throwing an exception if not found
   *
   * @param id - User ID to search for
   * @returns Promise resolving to the user
   * @throws BadRequestException if user not found
   */
  async getUserById(id: string): Promise<User> {
    const user = await this.findUserById(id);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  /**
   * Retrieves an authenticated user from JWT payload
   *
   * @param user - JWT payload containing user information
   * @returns Promise resolving to the authenticated user
   * @throws UnauthorizedException if user not found
   */
  async getAuthenticatedUser(userId: string): Promise<User> {
    const userProfile = await this.findUserById(userId);
    if (!userProfile) throw new UnauthorizedException("Unauthorized access");
    return userProfile;
  }

  /**
   * Creates a new user account and sends welcome email
   *
   * @param signupUserDto - User registration data
   * @returns Promise resolving to the created user
   * @throws ConflictException if email already exists
   * @throws BadRequestException if no default plan available
   */
  async create(signupUserDto: SignupUserDto): Promise<User> {
    const { email, password } = signupUserDto;
    const emailExists = await this.emailExists(email);
    if (emailExists) {
      throw new ConflictException("Email is already in use");
    }
    const hashedPassword = await hashString(password);
    const user = this.userRepository.create({
      ...signupUserDto,
      password: hashedPassword,
    });
    const new_user = await this.userRepository.save(user);
    return new_user;
  }

  /**
   * Authenticates a user with email and password, sending new login notification
   *
   * @param signinUserDto - Login credentials
   * @param clientInfo - Client information (IP, device, location)
   * @returns Promise resolving to the authenticated user
   * @throws ConflictException for invalid credentials
   */
  async signin(signinUserDto: SigninUserDto, clientInfo: ClientInfo) {
    const { email, password } = signinUserDto;
    const user = await this.findUserByEmailWithPassword(email);
    if (!user || !user.password) {
      throw new ConflictException("Invalid email or password");
    }
    const isPasswordValid = await verifyHash(password, user.password);
    if (!isPasswordValid) {
      throw new ConflictException("Invalid email or password");
    }
    const mailDto: NewLoginEmail = {
      name: user.name,
      email: user.email,
      timestamp: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      ip: clientInfo.ip,
      device: clientInfo.os,
      location: `${clientInfo.ipInfo.city}, ${clientInfo.ipInfo.country}`,
    };
    await this.emailQueue.add("send-new-login-email", { mailDto });
    return {
      ...user,
      profile_completed: await this.userProfileService.hasUserProfile(user.id),
    };
  }

  /**
   * Authenticates or creates a user with Google OAuth information
   *
   * @param googleUser - User information from Google OAuth
   * @returns Promise resolving to the authenticated or created user
   * @throws BadRequestException if no default plan available
   */
  async validateUserWithGoogle(googleUser: GoogleUser) {
    const { email, name, picture } = googleUser;
    let user: User;

    user = await this.findUserByEmail(email);
    if (!user) {
      const randomPassword = randomBytes(12).toString("hex");
      const hashedPassword = await hashString(randomPassword);

      const new_user = this.userRepository.create({
        email,
        name,
        avatar: picture,
        email_verified: true,
        password: hashedPassword,
      });

      user = await this.userRepository.save(new_user);
    }
    return user;
  }

  /**
   * Generates and sends an email verification code
   *
   * @param user - User to send verification code to
   * @returns Promise resolving to boolean indicating success
   * @throws BadRequestException if email already verified
   */
  async sendEmailVerificationCode(user: User, verificationCode: string) {
    const mailDto: EmailVerificationEmail = {
      email: user.email,
      name: user.name,
      otp_code: verificationCode,
      // verification_link: createEmailVerificationLink(
      // verificationToken,
      // this.CLIENT_URL,
      // ),
    };
    await this.emailQueue.add("send-email-verification-email", { mailDto });
    return true;
  }

  /**
   * Send welcome email with email verification code
   *
   * @param user - User to send verification code to
   * @returns Promise resolving to boolean indicating success
   * @throws BadRequestException if email already verified
   */
  async sendWelcomeEmail(user: User, otpCode: string) {
    const mailDto: WelcomeEmail = {
      email: user.email,
      name: user.name,
      otp_code: otpCode,
    };
    await this.emailQueue.add("send-welcome-email", { mailDto });
    return true;
  }

  /**
   * Sends a password reset email with reset token
   *
   * @param user - User requesting password reset
   * @param reset_token - Security token for password reset
   * @returns Promise resolving to boolean indicating success
   */
  async requestPasswordReset(user: User, reset_token: string) {
    const mailDto: ResetPasswordEmail = {
      email: user.email,
      name: user.name,
      reset_url: createResetPasswordLink(reset_token, this.CLIENT_URL),
    };
    await this.emailQueue.add("send-password-reset-email", { mailDto });
    return true;
  }

  /**
   * Changes a user's password after validating the old password
   *
   * @param user - User entity to update
   * @param changePasswordDto - Old and new password information
   * @returns Promise resolving to boolean indicating success
   * @throws ConflictException if old password is incorrect
   */
  async changePassword(user: User, changePasswordDto: ChangePasswordDto) {
    const user_obj = await this.findUserByIdWithPassword(user.id);
    const { old_password, new_password } = changePasswordDto;
    const isOldPasswordValid = await verifyHash(
      old_password,
      user_obj.password,
    );
    if (!isOldPasswordValid) {
      throw new ConflictException("old password is wrong");
    }
    await this.updateUserPasswordById(user.id, new_password);
    return true;
  }

  /**
   * Verifies a user's email address
   *
   * @param userId - User id to verify
   * @param status - Email verification new status
   * @returns Promise resolving to boolean indicating success
   */
  async updateEmailVerificationStatus(
    userId: string,
    status: boolean,
  ): Promise<boolean> {
    await this.userRepository.update(userId, { email_verified: status });
    return true;
  }

  /**
   * Searches for users based on query parameters with pagination
   *
   * @param query - Search parameters (name, email)
   * @param page - Page number for pagination (default: 1)
   * @param limit - Number of items per page (default: 20)
   * @returns Promise resolving to paginated user results
   */
  async findUsersPaginated(query: any, page: number = 1, limit: number = 20) {
    //TODO make this better combining pagination vars
    const queries: any = {};
    if (query.name) {
      queries.name = ILike(`%${query.name}%`);
    }
    if (query.email) {
      queries.email = query.email;
    }
    const [users, total] = await this.userRepository.findAndCount({
      where: {
        ...queries,
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      users,
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    };
  }

  /**
   * find  all users in db
   * @param filter all users search filters
   * @returns Promise resolving user
   */
  async findAllUsers(filter: UserFilters = {}): Promise<User[]> {
    return await this.userRepository.find({
      where: {
        ...filter,
      },
    });
  }
  async updateAvatar(userId: string, image: Express.Multer.File) {
    if (!image) throw new ConflictException("Image not provided");
    const updated = await this.userRepository.update(userId, {
      avatar: image.path,
    });
    if (updated.affected == 0) {
      throw new ConflictException("something went wrong");
    }
    return true;
  }
  async updateUserInfo(userId: string, updateUserDto: UpdateUserDto) {
    const updated = await this.userRepository.update(userId, updateUserDto);
    if (updated.affected == 0) {
      throw new ConflictException("something went wrong");
    }
    return true;
  }
  async updateUserPasswordById(id: string, plain_password: string) {
    const hashed_password = await hashString(plain_password);
    await this.userRepository.update(id, { password: hashed_password });
    return true;
  }
}
