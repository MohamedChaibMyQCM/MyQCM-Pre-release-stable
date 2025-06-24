import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { GoogleStrategy } from "./strategy/google.strategy";
import { AccessTokenStrategy } from "./strategy/access-token.strategy";
import { RefreshTokenStrategy } from "./strategy/refresh-token.strategy";
import { AuthController } from "./auth.controller";
import { UserModule } from "src/user/user.module";
import { FreelancerModule } from "src/freelancer/freelancer.module";
import { AdminModule } from "src/admin/admin.module";
import { RedisModule } from "src/redis/redis.module";
import { AuthUserController } from "./controllers/auth-user.controller";
import { AuthAdminController } from "./controllers/auth-admin.controller";
import { AuthFreelancerController } from "./controllers/auth-freelancer.controller";
import { AuthUserService } from "./services/auth-user.service";
import { AuthAdminService } from "./services/auth-admin.service";
import { AuthFreelancerService } from "./services/auth-freelancer.service";

@Module({
  imports: [
    PassportModule.register({}),
    JwtModule.register({}),
    RedisModule,
    AdminModule,
    UserModule,
    FreelancerModule,
  ],
  providers: [
    AuthService,
    AuthUserService,
    AuthAdminService,
    AuthFreelancerService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    GoogleStrategy,
  ],
  controllers: [
    AuthController,
    AuthUserController,
    AuthAdminController,
    AuthFreelancerController,
  ],
  exports: [AuthUserService],
})
export class AuthModule {}
