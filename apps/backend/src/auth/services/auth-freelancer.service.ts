import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtPayload } from "../types/interfaces/payload.interface";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { FreelancerService } from "src/freelancer/freelancer.service";
import {
  SigninFreelancerByCodeDto,
  SigninFreelancerDto,
} from "src/freelancer/dto/signin-freelancer.dto";
import { AuthService } from "../auth.service";
import { SignupFreelancerDto } from "src/freelancer/dto/create-freelancer.dto";
import { Request, Response } from "express";
import { extractClientInfo } from "common/utils/client-info.util";
import { verifyHash } from "common/utils/hashing";
import { RefreshTokenPayload } from "shared/interfaces/refresh-token-interface";

/**
 * Service responsible for handling authentication operations for freelancers
 */
@Injectable()
export class AuthFreelancerService {
  /**
   * Creates an instance of AuthFreelancerService
   * @param freelancerService - Service to handle freelancer-specific operations
   * @param authService - Core authentication service
   */
  constructor(
    private readonly freelancerService: FreelancerService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Authenticates a freelancer with email and password
   * @param signinFreelancer - DTO containing freelancer signin credentials
   * @returns JWT tokens for the authenticated freelancer
   */
  async signinFreelancer(
    signinFreelancer: SigninFreelancerDto,
    req: Request,
    res: Response,
  ) {
    const freelancer = await this.freelancerService.signin(signinFreelancer);
    const payload: JwtPayload = {
      id: freelancer.id,
      email: freelancer.email,
      role: BaseRoles.FREELANCER,
    };
    const clientInfo = await extractClientInfo(req);
    const tokens = await this.authService.signTokens(payload);
    await this.authService.createSafeSession(
      {
        userId: `freelancer:${freelancer.id}`,
        refreshToken: tokens.refreshToken,
        clientInfo,
      },
      res,
    );
    return tokens;
  }

  /**
   * Registers a new freelancer in the system
   * @param signupFreelancerDto - DTO containing freelancer registration data
   * @returns JWT tokens for the newly registered freelancer
   */
  async signupFreelancer(signupFreelancerDto: SignupFreelancerDto) {
    const freelancer = await this.freelancerService.create(signupFreelancerDto);
    const payload: JwtPayload = {
      id: freelancer.id,
      email: freelancer.email,
      role: BaseRoles.FREELANCER,
    };
    return this.authService.signTokens(payload);
  }

  /**
   * Authenticates a freelancer using a special code
   * @param signinFreelancerByCodeDto - DTO containing the authentication code
   * @returns JWT tokens for the authenticated freelancer
   */
  async signinFreelancerByCode(
    signinFreelancerByCodeDto: SigninFreelancerByCodeDto,
    req: Request,
    res: Response,
  ) {
    const freelancer = await this.freelancerService.signinByCode(
      signinFreelancerByCodeDto,
    );
    const payload: JwtPayload = {
      id: freelancer.id,
      email: freelancer.email,
      role: BaseRoles.FREELANCER,
    };
    const clientInfo = await extractClientInfo(req);
    const tokens = await this.authService.signTokens(payload);
    await this.authService.createSafeSession(
      {
        userId: `freelancer:${freelancer.id}`,
        refreshToken: tokens.refreshToken,
        clientInfo,
      },
      res,
    );
    return tokens;
  }

  /**
   * Retrieves freelancer information based on JWT payload
   * @param payload - JWT payload containing freelancer identification
   * @returns Freelancer entity corresponding to the provided payload
   */
  async getFreelancer(payload: JwtPayload) {
    return this.freelancerService.getOneById(payload.id);
  }

  async refreshToken(req: Request, res: Response) {
    const { refreshToken, iat, exp, ...payload } =
      req.user as RefreshTokenPayload;
    const clientInfo = await extractClientInfo(req);
    const hashedRefreshToken = await this.authService.validateUserSession(
      { clientInfo },
      req,
    );
    if (
      !hashedRefreshToken ||
      !(await verifyHash(refreshToken, hashedRefreshToken))
    ) {
      throw new BadRequestException("Invalid refresh token");
    }
    return this.authService.generateAccessToken(payload as JwtPayload);
  }
}
