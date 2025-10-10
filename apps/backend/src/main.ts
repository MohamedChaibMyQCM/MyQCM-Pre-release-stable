import { CreateServer } from "cmd/create.server";
import { getEnvOrFatal } from "common/utils/env.util";

async function bootstrap() {
  const app = await CreateServer();
  await app.listen(getEnvOrFatal<number>("APP_PORT") || 3000);
}

bootstrap();
