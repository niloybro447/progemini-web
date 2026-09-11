import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export function notFound(_req: Request, res: Response): void {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    error: { message: "Route not found" },
  });
}
