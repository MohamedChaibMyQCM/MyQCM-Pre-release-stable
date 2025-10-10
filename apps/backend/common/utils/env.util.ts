import { Duration } from "luxon";
import * as dotenv from "dotenv";
dotenv.config();

type EnvVarType =
  | "string"
  | "number"
  | "boolean"
  | "duration"
  | "url"
  | "enum"
  | "port";

interface EnvVarConfig {
  type: EnvVarType;
  enumValues?: string[];
}

const ENV_VAR_TYPES: Record<string, EnvVarConfig> = {
  // =============================
  // General App Configuration
  // =============================
  APP_NAME: { type: "string" },
  APP_ENV: {
    type: "enum",
    enumValues: ["development", "staging", "production"],
  },
  APP_PORT: { type: "port" },
  APP_DEBUG: { type: "boolean" },

  // Frontend and Backend URLs
  CLIENT_URL: { type: "url" },
  BACKEND_URL: { type: "url" },

  // =============================
  // Security & Authentication
  // =============================
  JWT_SECRET: { type: "string" },
  JWT_EXPIRATION: { type: "string" },
  JWT_REFRESH_SECRET: { type: "string" },
  JWT_REFRESH_EXPIRATION: { type: "string" },
  HASH_SALT: { type: "number" },

  // =============================
  // Database Configuration
  // =============================
  DB_DRIVER: { type: "string" },
  DB_HOST: { type: "string" },
  DB_PORT: { type: "port" },
  DB_USER: { type: "string" },
  DB_PASSWORD: { type: "string" },
  DB_NAME: { type: "string" },
  DB_SSL_MODE: { type: "enum", enumValues: ["enable", "disable"] },
  POOL_SIZE: { type: "number" },
  POOL_TIMEOUT: { type: "duration" },
  POOL_MAX_CONN_LIFETIME: { type: "duration" },

  // =============================
  // Cookie Configuration
  // =============================
  COOKIE_NAME: { type: "string" },
  COOKIE_DOMAIN: { type: "string" },
  COOKIE_HTTP_ONLY: { type: "boolean" },
  COOKIE_EXPIRATION: { type: "number" },
  COOKIE_SAME_SITE: { type: "enum", enumValues: ["strict", "lax", "none"] },

  // =============================
  // Two-Factor Authentication (TFA)
  // =============================
  TFA_ISSUER: { type: "string" },
  TFA_SECRET_TTL: { type: "number" },
  TFA_ENCRYPTION_KEY: { type: "string" },

  CHALLENGE_CREATION_LIMIT: { type: "number" },
  CHALLENGE_CREATION_WINDOW: { type: "number" },
  CHALLENGE_VERIFY_LIMIT: { type: "number" },
  CHALLENGE_VERIFY_WINDOW: { type: "number" },

  // =============================
  // Redis (Caching & Sessions)
  // =============================
  REDIS_HOST: { type: "string" },
  REDIS_PORT: { type: "port" },
  REDIS_PASSWORD: { type: "string" },

  // =============================
  // Email Service (SMTP)
  // =============================
  EMAIL_FROM: { type: "string" },
  GMAIL_USER: { type: "string" },
  GMAIL_APP_PASSWORD: { type: "string" },

  // =============================
  // Cloud Storage (AWS S3 / Cloudinary)
  // =============================
  CLOUDINARY_CLOUD_NAME: { type: "string" },
  CLOUDINARY_API_KEY: { type: "string" },
  CLOUDINARY_API_SECRET: { type: "string" },

  // =============================
  // Defaults
  // =============================
  DEFAULT_PROFILE_PICTURE: { type: "url" },

  // =============================
  // Third-Party Services
  // =============================
  GOOGLE_CLIENT_ID: { type: "string" },
  GOOGLE_CLIENT_SECRET: { type: "string" },
  GOOGLE_CALLBACK_URL: { type: "url" },

  CHARGILY_API_KEY: { type: "string" },
  CHARGILY_API_SECRET_KEY: { type: "string" },
  CHARGILY_SUCCESS_URL: { type: "url" },
  CHARGILY_MODE: { type: "string" },
};

function parseDuration(value: string): Duration {
  const durationRegex = /^(\d+)([smhd])$/;
  const match = value.match(durationRegex);

  if (!match) {
    throw new Error(
      `Invalid duration format: ${value}. Expected format: number + unit (s/m/h/d)`,
    );
  }

  const [, amount, unit] = match;
  const unitMap: Record<string, string> = {
    s: "seconds",
    m: "minutes",
    h: "hours",
    d: "days",
  };

  return Duration.fromObject({ [unitMap[unit]]: parseInt(amount) });
}

function parseEnvValue(value: string, config: EnvVarConfig): any {
  switch (config.type) {
    case "string":
      return value;

    case "number":
      const num = Number(value);
      if (isNaN(num)) {
        throw new Error(`Value "${value}" cannot be converted to a number`);
      }
      return num;

    case "boolean":
      if (value.toLowerCase() === "true") return true;
      if (value.toLowerCase() === "false") return false;
      throw new Error(`Value "${value}" cannot be converted to a boolean`);

    case "duration":
      return parseDuration(value);

    case "url":
      try {
        return new URL(value).toString();
      } catch {
        throw new Error(`Value "${value}" is not a valid URL`);
      }

    case "enum":
      if (!config.enumValues?.includes(value)) {
        throw new Error(
          `Value "${value}" must be one of: ${config.enumValues?.join(", ")}`,
        );
      }
      return value;

    case "port":
      const port = parseInt(value);
      if (isNaN(port) || port < 1 || port > 65535) {
        throw new Error(
          `Value "${value}" is not a valid port number (1-65535)`,
        );
      }
      return port;

    default:
      return value;
  }
}

function getEnvOrFatal<T>(name: string): T {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable is required.`);
  }

  const config = ENV_VAR_TYPES[name] || { type: "string" };

  try {
    return parseEnvValue(value, config) as T;
  } catch (error) {
    throw new Error(
      `Error parsing environment variable ${name}: ${(error as Error).message}`,
    );
  }
}

export { getEnvOrFatal };
