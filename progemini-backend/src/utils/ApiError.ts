import { StatusCodes, ReasonPhrases } from "http-status-codes";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    message: string = ReasonPhrases.INTERNAL_SERVER_ERROR,
    details?: unknown,
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(StatusCodes.BAD_REQUEST, message, details);
  }

  static unauthorized(message = "Unauthorized", details?: unknown) {
    return new AppError(StatusCodes.UNAUTHORIZED, message, details);
  }

  static forbidden(message = "Forbidden", details?: unknown) {
    return new AppError(StatusCodes.FORBIDDEN, message, details);
  }

  static notFound(message = "Resource not found", details?: unknown) {
    return new AppError(StatusCodes.NOT_FOUND, message, details);
  }

  static conflict(message: string, details?: unknown) {
    return new AppError(StatusCodes.CONFLICT, message, details);
  }

  static tooManyRequests(message = "Too many requests", details?: unknown) {
    return new AppError(StatusCodes.TOO_MANY_REQUESTS, message, details);
  }

  static internal(message = "Internal server error", details?: unknown) {
    return new AppError(StatusCodes.INTERNAL_SERVER_ERROR, message, details, false);
  }
}
