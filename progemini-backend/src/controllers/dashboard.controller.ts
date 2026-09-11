import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { getDashboardStats } from "@/services/dashboard.service";
import { StatusCodes } from "http-status-codes";

export const dashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const result = await getDashboardStats();
  res.status(StatusCodes.OK).json(result);
});
