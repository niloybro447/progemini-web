import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { getHealthStatus } from "@/services/healthCheck.service";

export const healthCheck = asyncHandler(async (_req: Request, res: Response) => {
  const health = await getHealthStatus();
  res.status(health.statusCode).json({
    success: true,
    data: health,
  });
});
