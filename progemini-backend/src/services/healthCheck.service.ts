import { StatusCodes } from "http-status-codes";
import { prisma } from "@/config/prisma";

export async function getHealthStatus() {
  const dbCheck = await prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);

  return {
    status: dbCheck ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbCheck ? "connected" : "disconnected",
    memory: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + "MB",
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
    },
    statusCode: StatusCodes.OK,
  };
}
