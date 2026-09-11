import { PrismaClient } from "@prisma/client";
import { config } from "@/config";
import { logger } from "@/utils/logger";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [
      { level: "query", emit: "event" },
      { level: "error", emit: "stdout" },
      { level: "warn", emit: "stdout" },
    ],
  });

if (config.nodeEnv !== "production") {
  globalForPrisma.prisma = prisma;
}

// Query logging is enabled via PrismaClient log config above.
// In development, queries are logged automatically.

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error({ err: error }, "Failed to connect to database");
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info("Database disconnected");
}
