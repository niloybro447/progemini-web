import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { config } from "@/config";
import { logger } from "@/utils/logger";
import routes from "@/routes";
import { notFound } from "@/middlewares/notFound";
import { errorHandler } from "@/middlewares/errorHandler";

export function createApp(): express.Express {
  const app = express();

  // Security headers
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

  // Dynamic CORS handling for multiple origins & credentials
  const allowedOrigins = typeof config.corsOrigin === "string"
    ? config.corsOrigin.split(",").map((o) => o.trim())
    : [config.corsOrigin];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
    }),
  );

  // Raw body for Stripe webhook (must be before express.json)
  app.use("/api/v1/webhooks/stripe", express.raw({ type: "application/json" }));
  app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }));

  // Body parsing
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // Cookie parsing
  app.use(cookieParser());

  // Request logging
  app.use((req, _res, next) => {
    logger.debug({ method: req.method, url: req.url }, "Incoming request");
    next();
  });

  // Mount API routes
  app.use("/api", routes);

  // 404 handler
  app.use(notFound);

  // Global error handler
  app.use(errorHandler);

  return app;
}
