import { Body, Controller, HttpStatus, Post, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
} from "@nestjs/swagger";
import {
  SigninFreelancerDto,
  SigninFreelancerByCodeDto,
} from "src/freelancer/dto/signin-freelancer.dto";
import { Roles } from "common/decorators/auth/roles.decorator";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { AuthFreelancerService } from "../services/auth-freelancer.service";
import { SignupFreelancerDto } from "src/freelancer/dto/create-freelancer.dto";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "../../../common/guards/auth/roles.guard";

/**
 * Controller responsible for freelancer authentication operations
 */
@ApiTags("Freelancer Auth")
@Controller("/auth/freelancer")
export class AuthFreelancerController {
  constructor(private readonly authFreelancerService: AuthFreelancerService) {}

  /**
   * Creates a new freelancer account (Admin only)
   */
  @Post("/signup")
  @ApiOperation({
    summary: "Create new freelancer",
    description:
      "Creates a new freelancer account in the system. Accessible only by administrators.",
  })
  @ApiBody({
    type: SignupFreelancerDto,
    description: "Freelancer registration details",
  })
  @ApiCreatedResponse({
    description: "Freelancer has been successfully registered",
  })
  @ApiConflictResponse({ description: "Email already exists" })
  @ApiUnauthorizedResponse({
    description: "Unauthorized - Missing or invalid token",
  })
  @ApiForbiddenResponse({
    description: "Forbidden - User does not have admin role",
  })
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  async signupFreelancer(@Body() signupFreelancerDto: SignupFreelancerDto) {
    const token =
      await this.authFreelancerService.signupFreelancer(signupFreelancerDto);
    return { message: "Freelancer signup successful", token };
  }

  /**
   * Authenticates a freelancer using email and password
   */
  @Post("/signin")
  @ApiOperation({
    summary: "Freelancer signin",
    description:
      "Authenticates a freelancer with email and password credentials",
  })
  @ApiBody({
    type: SigninFreelancerDto,
    description: "Freelancer login credentials",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Freelancer has been successfully authenticated",
  })
  @ApiUnauthorizedResponse({ description: "Invalid credentials" })
  @ApiNotFoundResponse({ description: "Freelancer not found" })
  async signinFreelancer(@Body() signinFreelancerDto: SigninFreelancerDto) {
    const token =
      await this.authFreelancerService.signinFreelancer(signinFreelancerDto);
    return {
      message: "Freelancer signed in successfully",
      status: HttpStatus.OK,
      token,
    };
  }

  /**
   * Authenticates a freelancer using a special code
   */
  @Post("/code-signin")
  @ApiOperation({
    summary: "Freelancer signin by code",
    description:
      "Authenticates a freelancer using a special authentication code",
  })
  @ApiBody({
    type: SigninFreelancerByCodeDto,
    description: "Authentication code details",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Freelancer has been successfully authenticated via code",
  })
  @ApiUnauthorizedResponse({ description: "Invalid authentication code" })
  @ApiNotFoundResponse({ description: "Freelancer not found or code expired" })
  async signinByCode(
    @Body() signinFreelancerByCodeDto: SigninFreelancerByCodeDto,
  ) {
    const token = await this.authFreelancerService.signinFreelancerByCode(
      signinFreelancerByCodeDto,
    );
    return {
      message: "Freelancer signed in successfully",
      status: HttpStatus.OK,
      token,
    };
  }
}
