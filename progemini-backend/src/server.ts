import 'dotenv/config';
import { config } from "@/config";
import { logger } from "@/utils/logger";
import { createApp } from "@/app";
import { connectDatabase, disconnectDatabase } from "@/config/prisma";

async function bootstrap() {
  try {
    await connectDatabase();
  } catch {
    logger.warn("Starting without database — API routes requiring DB will fail");
  }

  const app = createApp();

  const server = app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} [${config.nodeEnv}]`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await disconnectDatabase();
      logger.info("Server shut down");
      process.exit(0);
    });

    // Force shutdown after 10s
    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandled promise rejection");
  });

  process.on("uncaughtException", (error) => {
    logger.fatal({ err: error }, "Uncaught exception");
    process.exit(1);
  });
}

bootstrap();
