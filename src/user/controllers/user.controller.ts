import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  HttpStatus,
  Query,
  UploadedFile,
  UseInterceptors,
  Put,
  Param,
  ParseUUIDPipe,
} from "@nestjs/common";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { Roles } from "common/decorators/auth/roles.decorator";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { GetUser } from "common/decorators/auth/get-user.decorator";
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiBody,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { MulterConfig } from "config/multer.config";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { UserService } from "../services/user.service";
import { User } from "../entities/user.entity";
import { ChangePasswordDto } from "../types/dtos/change-password.dto";
import { JwtPayload } from "src/auth/types/interfaces/payload.interface";
import { UpdateUserDto } from "../types/dtos/update-user.dto";

@ApiTags("User")
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/me")
  @ApiOperation({ summary: "Get authenticated user profile" })
  @ApiResponse({
    status: 200,
    description: "User profile fetched successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.USER)
  async getAuthenticatedUser(@GetUser() user: JwtPayload) {
    const data = await this.userService.getAuthenticatedUser(user.id);
    return {
      message: "User fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get("/all")
  @ApiOperation({ summary: "Get all users (Admin only)" })
  @ApiQuery({ name: "name", required: false, description: "Filter by name" })
  @ApiQuery({ name: "email", required: false, description: "Filter by email" })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Pagination page number",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of users per page",
  })
  @ApiResponse({ status: 200, description: "Users fetched successfully" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  async findAll(
    @Query() query: any,
    @Query("page") page: number,
    @Query("limit") limit: number,
  ) {
    const data = await this.userService.findUsersPaginated(query, page, limit);
    return {
      message: "Users fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Get("/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})") // works only when the id is uuid
  @ApiOperation({ summary: "Get user by ID" })
  @ApiResponse({ status: 200, description: "User fetched successfully" })
  @ApiResponse({ status: 400, description: "Invalid ID format" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "User not found" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.USER)
  async getUser(
    @GetUser() user: JwtPayload,
    @Param("id", new ParseUUIDPipe()) id: string,
  ) {
    const data = await this.userService.getUserById(id);
    return {
      message: "User fetched successfully",
      status: HttpStatus.OK,
      data,
    };
  }

  @Put("/change-password")
  @ApiOperation({ summary: "Change user password" })
  @ApiBody({
    type: ChangePasswordDto,
    description: "Old and new password data",
  })
  @ApiResponse({ status: 201, description: "Password changed successfully" })
  @ApiResponse({ status: 400, description: "Invalid old password" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.USER)
  async changePassword(
    @GetUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const data = await this.userService.changePassword(user, changePasswordDto);
    return {
      message: "Password changed successfully",
      status: HttpStatus.CREATED,
      data,
    };
  }

  @Patch("/")
  @ApiOperation({ summary: "Update user data (for now includes only name)" })
  @ApiResponse({ status: 201, description: "User data updated successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.USER)
  @UseInterceptors(FileInterceptor("image", MulterConfig))
  async updateInfo(
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.userService.updateUserInfo(user.id, updateUserDto);
    return {
      message: "User inforamtions updated successfully",
      status: HttpStatus.CREATED,
    };
  }
  @Patch("/image")
  @ApiOperation({ summary: "Update user profile image (Multipart Form-Data)" })
  @ApiResponse({ status: 201, description: "User image updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid image format" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.USER)
  @UseInterceptors(FileInterceptor("image", MulterConfig))
  async updateImage(
    @GetUser() user: User,
    @UploadedFile() image: Express.Multer.File,
  ) {
    await this.userService.updateAvatar(user.id, image);
    return {
      message: "User image updated successfully",
      status: HttpStatus.CREATED,
    };
  }
}
