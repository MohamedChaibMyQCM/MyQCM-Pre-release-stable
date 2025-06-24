import { getEnvOrFatal } from "common/utils/env.util";
import { CookieOptions } from "express";

export const CookieConfig: CookieOptions = {
  httpOnly: true,
  secure: getEnvOrFatal("APP_ENV") === "production",
  sameSite: getEnvOrFatal("APP_ENV") === "production" ? "none" : "lax",
  domain: getEnvOrFatal("COOKIE_DOMAIN"),
};
