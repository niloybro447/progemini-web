import { Router } from "express";
import { authenticate, authorize } from "@/middlewares/authenticate";
import * as ec from "@/controllers/email.controller";

const router = Router();

// Public Tracking Routes (No Auth)
router.get("/track", ec.trackEmail);

// Admin Email Routes (Protected)
router.get("/campaigns", authenticate, authorize("ADMIN"), ec.getCampaigns);
router.post("/campaigns", authenticate, authorize("ADMIN"), ec.saveCampaign);
router.patch("/campaigns", authenticate, authorize("ADMIN"), ec.patchCampaign);
router.delete("/campaigns", authenticate, authorize("ADMIN"), ec.deleteCampaign);

router.get("/contacts", authenticate, authorize("ADMIN"), ec.getContacts);
router.post("/contacts", authenticate, authorize("ADMIN"), ec.saveContacts);
router.delete("/contacts", authenticate, authorize("ADMIN"), ec.deleteContacts);

router.post("/send", authenticate, authorize("ADMIN"), ec.sendEmail);
router.get("/analytics", authenticate, authorize("ADMIN"), ec.getAnalytics);
router.post("/analyze", authenticate, authorize("ADMIN"), ec.analyzeContent);

export default router;
