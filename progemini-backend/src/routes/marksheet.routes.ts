import { Router } from "express";
import { authenticate, authorize } from "@/middlewares/authenticate";
import * as mc from "@/controllers/marksheet.controller";

const router = Router();

// Authenticated: view user marksheets
router.get("/marksheets/user/:userId", authenticate, mc.getUserMarksheets);
router.get("/marksheets/my", authenticate, mc.getUserMarksheets);
router.get("/marksheets/:id/pdf", authenticate, mc.downloadMarksheetPdf);
router.post("/marksheets/pdf", authenticate, mc.renderMarksheetPdfFromData);
router.get("/marksheets/:id", authenticate, mc.getMarksheet);

// Admin-only management
router.post(
  "/admin/marksheets",
  authenticate,
  authorize("ADMIN"),
  mc.upsertMarksheet,
);

router.put(
  "/admin/marksheets/:id",
  authenticate,
  authorize("ADMIN"),
  mc.upsertMarksheet,
);

router.delete(
  "/admin/marksheets/:id",
  authenticate,
  authorize("ADMIN"),
  mc.deleteMarksheet,
);

export default router;
