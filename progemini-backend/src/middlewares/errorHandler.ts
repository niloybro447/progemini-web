import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { logger } from "@/utils/logger";
import { config } from "@/config";
import { AppError } from "@/utils/ApiError";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error({ err }, "Non-operational error");
    }
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
        ...(config.nodeEnv !== "production" ? { stack: err.stack } : {}),
      },
    });
    return;
  }

  logger.error({ err }, "Unhandled error");
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      message: "Internal server error",
      ...(config.nodeEnv !== "production" ? { stack: err.stack } : {}),
    },
  });
}
