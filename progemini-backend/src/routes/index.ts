import { Router } from "express";
import healthCheckRoutes from "@/routes/healthCheck.routes";
import authRoutes from "@/routes/auth.routes";
import userRoutes from "@/routes/user.routes";
import courseRoutes from "@/routes/course.routes";
import orderRoutes from "@/routes/order.routes";
import fileRoutes from "@/routes/file.routes";
import cmsRoutes from "@/routes/cms.routes";
import applicationRoutes from "@/routes/application.routes";
import attendanceRoutes from "@/routes/attendance.routes";
import dashboardRoutes from "@/routes/dashboard.routes";
import * as oc from "@/controllers/order.controller";

const router = Router();

router.use("/health", healthCheckRoutes);
router.use("/v1/auth", authRoutes);
router.use("/v1/users", userRoutes);
router.use("/v1", courseRoutes);
router.use("/v1", orderRoutes);
router.use("/v1", fileRoutes);
router.use("/v1", cmsRoutes);
router.use("/v1", applicationRoutes);
router.use("/v1", attendanceRoutes);
router.use("/v1", dashboardRoutes);

// Stripe webhook — raw body handled in app.ts, auth via signature
router.post("/v1/webhooks/stripe", oc.handleStripeWebhook);

export default router;
