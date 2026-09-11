import { Router } from "express";
import { authenticate, authorize } from "@/middlewares/authenticate";
import * as ac from "@/controllers/application.controller";

const router = Router();

// ─── Applications ──────────────────────────────────────
router.post("/applications", authenticate, authorize("STUDENT"), ac.createApplication);
router.get("/applications", authenticate, authorize("STUDENT", "ADMIN"), ac.listApplications);
router.get("/applications/check", authenticate, authorize("STUDENT"), ac.checkApplication);
router.get("/applications/:id", authenticate, authorize("STUDENT", "ADMIN"), ac.getApplicationById);
router.put("/applications/:id", authenticate, authorize("STUDENT"), ac.updateApplicationContent);
router.patch("/applications/:id", authenticate, authorize("ADMIN"), ac.updateApplicationStatus);
router.delete("/applications/:id", authenticate, authorize("STUDENT", "ADMIN"), ac.deleteApplication);

// ─── Enquiries ─────────────────────────────────────────
router.post("/enquiries", ac.createEnquiry);
router.get("/admin/enquiries", authenticate, authorize("ADMIN"), ac.listEnquiries);
router.get("/admin/enquiries/:id", authenticate, authorize("ADMIN"), ac.getEnquiryById);
router.patch("/admin/enquiries/:id", authenticate, authorize("ADMIN"), ac.updateEnquiryStatus);
router.delete("/admin/enquiries/:id", authenticate, authorize("ADMIN"), ac.deleteEnquiry);

// ─── Contact (stub) ────────────────────────────────────
router.post("/contact", ac.handleContactForm);

export default router;
