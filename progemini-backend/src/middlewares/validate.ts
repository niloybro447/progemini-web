import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { AppError } from "@/utils/ApiError";

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const result = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = result.body;
      req.query = result.query;
      req.params = result.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formatted = error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        }));
        next(AppError.badRequest("Validation failed", formatted));
      } else {
        next(error);
      }
    }
  };
}
