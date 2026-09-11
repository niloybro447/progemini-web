import { Router } from "express";
import { authenticate, authorize } from "@/middlewares/authenticate";
import { dashboardStats } from "@/controllers/dashboard.controller";

const router = Router();

router.get("/admin/dashboard/stats", authenticate, authorize("ADMIN"), dashboardStats);

export default router;
