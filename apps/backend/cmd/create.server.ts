import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { GlobalExceptionFilter } from "common/filters/global-expection.filter";
import { CorsConfig } from "config/cors.config";
import { SetupSwagger } from "config/swagger.config";
import { ValidationPipeConfig } from "config/validation-pipe.config";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "src/app.module";
import { json } from "body-parser";
import { dynamicImport } from "common/helper/dynamic-import.helper";

// This function creates and configures a NestJS Express-based server
export async function CreateServer(): Promise<NestExpressApplication> {
  // Create a new NestJS application using the AppModule
  const server = await NestFactory.create<NestExpressApplication>(AppModule);

  // Set up Swagger for API documentation
  SetupSwagger(server);

  // Configure body parser to handle large JSON payloads and retain raw request body
  server.use(
    json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf; // Stores the raw request body for later verification (e.g., webhook signature validation)
      },
      limit: "100mb", // Allows up to 100MB request payloads (useful for large file uploads)
    }),
  );

  // Trust the proxy headers (needed if the app runs behind a reverse proxy like Nginx)
  server.set("trust proxy", true);

  // Enable cookie parsing to read cookies from requests
  server.use(cookieParser());

  // Enable CORS (Cross-Origin Resource Sharing) using the predefined configuration
  server.enableCors(CorsConfig);

  // Set up global validation pipes to validate incoming request data based on DTOs
  server.useGlobalPipes(new ValidationPipe(ValidationPipeConfig));

  // Use Helmet to set security-related HTTP headers and mitigate common vulnerabilities
  server.use(helmet());

  // Register a global exception filter to handle errors consistently across the app
  server.useGlobalFilters(new GlobalExceptionFilter());

  const adminJSModule = await dynamicImport("adminjs");
  const AdminJS = adminJSModule.default;

  const AdminJSTypeORM = await dynamicImport("@adminjs/typeorm");

  AdminJS.registerAdapter({
    Resource: AdminJSTypeORM.Resource,
    Database: AdminJSTypeORM.Database,
  });
  return server; // Return the configured server instance
}
