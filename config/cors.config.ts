import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import { getEnvOrFatal } from "common/utils/env.util";

const isDevelopment = getEnvOrFatal("APP_ENV") === "development";

const productionOrigins = [
  "https://app.myqcmdz.com",
  "https://server.myqcmdz.com",
  "https://myqcmdz.com",
  "https://freelancer.myqcmdz.com",
];

const developmentOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
];

export const CorsConfig: CorsOptions = {
  origin: isDevelopment
    ? [...developmentOrigins, ...productionOrigins]
    : productionOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};
