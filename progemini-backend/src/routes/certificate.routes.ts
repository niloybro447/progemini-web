import { Router } from "express";
import { authenticate, authorize } from "@/middlewares/authenticate";
import * as cc from "@/controllers/certificate.controller";

const router = Router();

// ─── Public Certificate Verification ─────────────────────
// Can verify via encrypted token or ID:
// e.g. GET /api/v1/certificates/verify/:token
//      GET /api/v1/certificates/verify?token=...
router.get("/certificates/verify/:token", cc.verifyCertificate);
router.get("/certificates/verify", cc.verifyCertificate);

// ─── Authenticated Certificate Routes ───────────────────
// Students & Admins can get certificates (service filters unpublished for students)
router.get("/certificates/user/all", authenticate, cc.getAllCertificates);
router.get("/certificates/all", authenticate, cc.getAllCertificates);
router.get("/certificates/user/:userId", authenticate, cc.getUserCertificates);
router.get("/certificates/my", authenticate, cc.getUserCertificates);
router.get("/certificates/:id/pdf", authenticate, cc.downloadCertificatePdf);
router.post("/certificates/pdf", authenticate, cc.renderCertificatePdfFromData);
router.get("/certificates/:id", authenticate, cc.getCertificate);

// ─── Admin-only Management Endpoints ────────────────────
router.get(
  "/admin/certificates",
  authenticate,
  authorize("ADMIN"),
  cc.getAllCertificates,
);

router.get(
  "/admin/certificates/generate-id",
  authenticate,
  authorize("ADMIN"),
  cc.generateCertificateId,
);

router.post(
  "/admin/certificates",
  authenticate,
  authorize("ADMIN"),
  cc.upsertCertificate,
);

router.put(
  "/admin/certificates/:id",
  authenticate,
  authorize("ADMIN"),
  cc.upsertCertificate,
);

router.post(
  "/admin/certificates/:id/publish",
  authenticate,
  authorize("ADMIN"),
  cc.publishCertificate,
);

router.post(
  "/admin/certificates/:id/unpublish",
  authenticate,
  authorize("ADMIN"),
  cc.unpublishCertificate,
);

router.delete(
  "/admin/certificates/:id",
  authenticate,
  authorize("ADMIN"),
  cc.deleteCertificate,
);

export default router;
