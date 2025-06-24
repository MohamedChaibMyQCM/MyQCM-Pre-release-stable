import { JwtSignOptions } from "@nestjs/jwt";
import { getEnvOrFatal } from "common/utils/env.util";

export const JwtAccessConfig: JwtSignOptions = {
  secret: getEnvOrFatal("JWT_SECRET"),
  expiresIn: getEnvOrFatal("JWT_EXPIRATION"),
};

export const JwtRefreshConfig: JwtSignOptions = {
  secret: getEnvOrFatal("JWT_REFRESH_SECRET"),
  expiresIn: getEnvOrFatal("JWT_REFRESH_EXPIRATION"),
};
