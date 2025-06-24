import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { AuthService } from "../auth.service";
import { getEnvOrFatal } from "common/utils/env.util";
import { extractClientInfo } from "common/utils/client-info.util";
import { AuthUserService } from "../services/auth-user.service";
import { BaseRoles } from "shared/enums/base-roles.enum";

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private readonly authService: AuthService,
    private readonly authUserService: AuthUserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: getEnvOrFatal("JWT_SECRET"),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    if (payload.role == BaseRoles.USER) {
      /*await this.authService.validateUserSession(
        {
          clientInfo: await extractClientInfo(req),
        },
        req,
      );*/
      await this.authUserService.validateUser(payload, req);
    }
    return payload;
  }
}
