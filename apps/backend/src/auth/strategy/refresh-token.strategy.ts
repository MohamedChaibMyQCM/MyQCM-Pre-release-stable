import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { Request } from "express";
import { Injectable } from "@nestjs/common";
import { getEnvOrFatal } from "common/utils/env.util";

interface JwtPayload {
  sub: string;
  email: string;
  [key: string]: any;
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh",
) {
  private readonly REFRESH_TOKEN_COOKIE_NAME = getEnvOrFatal<string>(
    "REFRESH_TOKEN_COOKIE_NAME",
  );
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        return req?.cookies?.[this.REFRESH_TOKEN_COOKIE_NAME] || null;
      },
      secretOrKey: getEnvOrFatal<string>("JWT_REFRESH_SECRET"),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<any> {
    const cookieName = this.REFRESH_TOKEN_COOKIE_NAME;
    const refreshToken = req.cookies?.[cookieName] || null;

    return {
      ...payload,
      refreshToken,
    };
  }
}
