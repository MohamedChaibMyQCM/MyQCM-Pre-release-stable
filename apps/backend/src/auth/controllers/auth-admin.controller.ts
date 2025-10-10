import { Body, Controller, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthAdminService } from "../services/auth-admin.service";
import { CreateAdminDto } from "src/admin/dto/create-admin.dto";
import { SigninAdminDto } from "src/admin/dto/signin-admin.dto";
import { AccessTokenGuard } from "common/guards/auth/access-token.guard";
import { RolesGuard } from "common/guards/auth/roles.guard";
import { Roles } from "common/decorators/auth/roles.decorator";
import { BaseRoles } from "shared/enums/base-roles.enum";

@ApiTags("Admin Auth")
@Controller("auth/admin")
export class AuthAdminController {
  constructor(private readonly authAdminService: AuthAdminService) {}

  @Post("/signup")
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles(BaseRoles.ADMIN)
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    const token = await this.authAdminService.signupAdmin(createAdminDto);
    return {
      message: "Admin created successfully",
      status: HttpStatus.CREATED,
      token,
    };
  }

  @Post("/signin")
  async signinAdmin(@Body() signinAdminDto: SigninAdminDto) {
    const token = await this.authAdminService.signinAdmin(signinAdminDto);
    return { message: "Login successful", status: HttpStatus.OK, token };
  }
}
