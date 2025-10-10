import { Injectable } from "@nestjs/common";
import { BaseRoles } from "shared/enums/base-roles.enum";
import { CreateAdminDto } from "src/admin/dto/create-admin.dto";
import { JwtPayload } from "../types/interfaces/payload.interface";
import { AdminService } from "src/admin/admin.service";
import { SigninAdminDto } from "src/admin/dto/signin-admin.dto";
import { AuthService } from "../auth.service";

@Injectable()
export class AuthAdminService {
  constructor(
    private readonly adminService: AdminService,
    private readonly authService: AuthService,
  ) {}
  async signupAdmin(createAdminDto: CreateAdminDto) {
    const admin = await this.adminService.create(createAdminDto);
    const payload: JwtPayload = {
      id: admin.id,
      email: admin.email,
      role: BaseRoles.ADMIN,
    };
    return this.authService.signTokens(payload);
  }
  async signinAdmin(signinAdminDto: SigninAdminDto) {
    const admin = await this.adminService.signin(signinAdminDto);
    const payload: JwtPayload = {
      id: admin.id,
      email: admin.email,
      role: BaseRoles.ADMIN,
    };
    return this.authService.signTokens(payload);
  }
  async getAdmin(payload: JwtPayload) {
    return this.adminService.getAdminById(payload.id);
  }
}
