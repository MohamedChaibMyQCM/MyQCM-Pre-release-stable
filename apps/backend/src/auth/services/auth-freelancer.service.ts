import { Injectable } from "@nestjs/common";
import { JwtPayload } from "../types/interfaces/payload.interface";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { FreelancerService } from "src/freelancer/freelancer.service";
import {
  SigninFreelancerByCodeDto,
  SigninFreelancerDto,
} from "src/freelancer/dto/signin-freelancer.dto";
import { AuthService } from "../auth.service";
import { SignupFreelancerDto } from "src/freelancer/dto/create-freelancer.dto";

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
  async signinFreelancer(signinFreelancer: SigninFreelancerDto) {
    const freelancer = await this.freelancerService.signin(signinFreelancer);
    const payload: JwtPayload = {
      id: freelancer.id,
      email: freelancer.email,
      role: BaseRoles.FREELANCER,
    };
    return this.authService.signTokens(payload);
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
  ) {
    const freelancer = await this.freelancerService.signinByCode(
      signinFreelancerByCodeDto,
    );
    const payload: JwtPayload = {
      id: freelancer.id,
      email: freelancer.email,
      role: BaseRoles.FREELANCER,
    };
    return this.authService.signTokens(payload);
  }

  /**
   * Retrieves freelancer information based on JWT payload
   * @param payload - JWT payload containing freelancer identification
   * @returns Freelancer entity corresponding to the provided payload
   */
  async getFreelancer(payload: JwtPayload) {
    return this.freelancerService.getOneById(payload.id);
  }
}
