import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "@/config";
import { AppError } from "@/utils/ApiError";
import { asyncHandler } from "@/utils/asyncHandler";

function extractToken(req: Request): string {
  // Priority 1: Bearer header (standard backend JWT)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  // Priority 2: Backend cookie
  if (req.cookies?.token) {
    return req.cookies.token;
  }
  // Priority 3: NextAuth session cookie
  const nextAuthCookie =
    req.cookies?.["next-auth.session-token"] ||
    req.cookies?.["__Secure-next-auth.session-token"];
  if (nextAuthCookie) {
    return nextAuthCookie;
  }
  throw AppError.unauthorized("No authentication token provided");
}

export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as Record<string, unknown>;
    // Normalize payload — NextAuth uses "sub" for user ID, backend uses "id"
    req.user = {
      id: (decoded.id || decoded.sub) as string,
      email: decoded.email as string,
      role: decoded.role as "ADMIN" | "STUDENT",
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(AppError.unauthorized("Token expired"));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(AppError.unauthorized("Invalid token"));
    } else {
      next(error);
    }
  }
});

export function authorize(...roles: ("ADMIN" | "STUDENT")[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized("Not authenticated"));
      return;
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      next(AppError.forbidden("Insufficient permissions"));
      return;
    }
    next();
  };
}
