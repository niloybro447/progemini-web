import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import * as authService from "@/services/auth.service";
import { StatusCodes } from "http-status-codes";

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.ip ||
    "unknown"
  );
}

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const result = await authService.signup(name, email, password, getClientIp(req));
  res.status(result.statusCode).json({ message: result.message, user: result.user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.status(StatusCodes.OK).json(result);
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;
  const result = await authService.verifyEmail(token);
  res.status(StatusCodes.OK).json(result);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  res.status(StatusCodes.OK).json(result);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  const result = await authService.resetPassword(token, password);
  res.status(StatusCodes.OK).json(result);
});
