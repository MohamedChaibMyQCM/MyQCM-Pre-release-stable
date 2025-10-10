import { DocumentBuilder, SwaggerModule, OpenAPIObject } from "@nestjs/swagger";
import { INestApplication } from "@nestjs/common";
import { getEnvOrFatal } from "common/utils/env.util";

export const SetupSwagger = (app: INestApplication): void => {
  const isDevelopment = getEnvOrFatal("APP_ENV") === "development";

  // Only setup Swagger in development environment
  if (!isDevelopment) {
    return;
  }

  const config = new DocumentBuilder()
    .setTitle("My qcm API")
    .setDescription("API Documentation for myqcm alzajayr")
    .setVersion("2.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter JWT token",
      },
      "session-auth",
    )
    .addServer("http://localhost:3000", "Local environment")
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);

  // Apply security globally
  document.security = [{ "session-auth": [] }];

  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      filter: true,
      displayRequestDuration: true,
      docExpansion: "none",
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
      tagsSorter: "alpha",
    },
    customSiteTitle: "myqcm aljazayer API Docs",
  });
};
