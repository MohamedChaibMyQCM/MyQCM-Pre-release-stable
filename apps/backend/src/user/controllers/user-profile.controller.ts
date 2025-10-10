import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { UserProfileService } from "../services/user-profile.service";
import { ApiOperation } from "@nestjs/swagger";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { Roles } from "common/decorators/auth/roles.decorator";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { CreateUserProfileDto } from "../types/dtos/create-user-profile.dto";
import { ApiTags, ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { ResponseInterface } from "shared/interfaces/response.interface";
import { UpdateUserProfileDto } from "../services/update-user-profile.dto";

@ApiTags("User Profile")
@ApiBearerAuth()
@Controller("/user/profile")
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get("/")
  @ApiOperation({
    summary: "Get user profile",
    description: "Fetches the authenticated user's profile information.",
  })
  @ApiResponse({
    status: 200,
    description: "User profile retrieved successfully.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 404, description: "User profile not found." })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.USER)
  async getUserProfile(@GetUser() user: JwtPayload) {
    const data = await this.userProfileService.getUserProfileById(user.id);
    return {
      message: "User profile fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Post("/")
  @ApiOperation({
    summary: "Create user profile",
    description:
      "Creates a new user profile linked to a university and faculty.",
  })
  @ApiResponse({ status: 201, description: "Profile created successfully." })
  @ApiResponse({ status: 400, description: "Profile already exists." })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.USER)
  async createProfile(
    @GetUser() user: JwtPayload,
    @Body() createUserProfileDto: CreateUserProfileDto,
  ): Promise<ResponseInterface<null>> {
    await this.userProfileService.createUserProfile(user, createUserProfileDto);
    return {
      message: "Profile created successfully",
      status: HttpStatus.CREATED,
    };
  }
  @Patch("/")
  @ApiOperation({
    summary: "Update user profile",
    description: "Updates the authenticated user's profile information.",
  })
  @ApiResponse({
    status: 200,
    description: "User profile updated successfully.",
  })
  @ApiResponse({ status: 401, description: "Unauthorized." })
  @ApiResponse({ status: 404, description: "User profile not found." })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.USER)
  async updateUserProfile(
    @GetUser() user: JwtPayload,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<ResponseInterface<null>> {
    await this.userProfileService.updateUserProfile(
      user.id,
      updateUserProfileDto,
    );
    return {
      message: "User profile updated successfully",
      status: HttpStatus.OK,
    };
  }
}
