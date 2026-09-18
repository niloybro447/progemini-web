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
import emailRoutes from "@/routes/email.routes";
import studentProfileRoutes from "@/routes/studentProfile.routes";
import * as oc from "@/controllers/order.controller";

const router = Router();

// ─── Health ──────────────────────────────────────────────
router.use("/health", healthCheckRoutes);

// ─── Standard /v1 Routes ─────────────────────────────────
router.use("/v1/auth", authRoutes);
router.use("/v1/users", userRoutes);
router.use("/v1/student", studentProfileRoutes);
router.use("/v1", studentProfileRoutes);
router.use("/v1", courseRoutes);
router.use("/v1", orderRoutes);
router.use("/v1", fileRoutes);
router.use("/v1", cmsRoutes);
router.use("/v1", applicationRoutes);
router.use("/v1", attendanceRoutes);
router.use("/v1", dashboardRoutes);
router.use("/v1/admin/email", emailRoutes);
router.use("/v1/email", emailRoutes);

// Stripe webhook — raw body handled in app.ts, auth via signature
router.post("/v1/webhooks/stripe", oc.handleStripeWebhook);
router.post("/webhooks/stripe", oc.handleStripeWebhook);

// ─── Direct Compatibility Aliases (No /v1 prefix) ─────────
// Allows frontend components calling /api/... directly to succeed without 404s
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/student", studentProfileRoutes);
router.use("/", studentProfileRoutes);
router.use("/", courseRoutes);
router.use("/", orderRoutes);
router.use("/", fileRoutes);
router.use("/", cmsRoutes);
router.use("/", applicationRoutes);
router.use("/", attendanceRoutes);
router.use("/", dashboardRoutes);
router.use("/admin/email", emailRoutes);
router.use("/email", emailRoutes);

export default router;
