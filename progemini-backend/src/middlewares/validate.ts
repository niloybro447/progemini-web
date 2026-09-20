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
      if (result.body !== undefined) req.body = result.body;
      if (result.query !== undefined) req.query = result.query;
      if (result.params !== undefined) req.params = result.params;
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
