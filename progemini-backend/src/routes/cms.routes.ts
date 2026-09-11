import { Router } from "express";
import { authenticate, authorize } from "@/middlewares/authenticate";
import * as cc from "@/controllers/cms.controller";

const router = Router();

// ─── Consultants (Public read / Admin write) ───────────
router.get("/consultants", cc.listConsultants);
router.post("/consultants", authenticate, authorize("ADMIN"), cc.createConsultant);
router.get("/consultants/:id", cc.getConsultantById);
router.patch("/consultants/:id", authenticate, authorize("ADMIN"), cc.updateConsultant);
router.delete("/consultants/:id", authenticate, authorize("ADMIN"), cc.deleteConsultant);

// ─── Academic Team (Public read / Admin write) ─────────
router.get("/academic-team", cc.listAcademicTeam);
router.post("/academic-team", authenticate, authorize("ADMIN"), cc.createAcademicMember);
router.get("/academic-team/:id", cc.getAcademicMemberById);
router.patch("/academic-team/:id", authenticate, authorize("ADMIN"), cc.updateAcademicMember);
router.delete("/academic-team/:id", authenticate, authorize("ADMIN"), cc.deleteAcademicMember);

// ─── Partner Universities (Public read / Admin write) ──
router.get("/partner-universities", cc.listPartnerUniversities);
router.post("/partner-universities", authenticate, authorize("ADMIN"), cc.createPartnerUniversity);
router.get("/partner-universities/:id", cc.getPartnerUniversityById);
router.patch("/partner-universities/:id", authenticate, authorize("ADMIN"), cc.updatePartnerUniversity);
router.delete("/partner-universities/:id", authenticate, authorize("ADMIN"), cc.deletePartnerUniversity);

// ─── Hero Slides (Public read / Admin write) ───────────
router.get("/hero-slides", cc.listHeroSlides);
router.post("/hero-slides", authenticate, authorize("ADMIN"), cc.createHeroSlide);
router.get("/hero-slides/:id", cc.getHeroSlideById);
router.patch("/hero-slides/:id", authenticate, authorize("ADMIN"), cc.updateHeroSlide);
router.delete("/hero-slides/:id", authenticate, authorize("ADMIN"), cc.deleteHeroSlide);

// ─── Senior Profiles (Admin only) ─────────────────────
router.get("/senior-profiles", cc.listSeniorProfiles);
router.get("/senior-profiles/slug/:slug", cc.getSeniorProfileBySlug);
router.get("/admin/senior-profiles", authenticate, authorize("ADMIN"), cc.listSeniorProfiles);
router.post("/admin/senior-profiles", authenticate, authorize("ADMIN"), cc.createSeniorProfile);
router.get("/admin/senior-profiles/:id", authenticate, authorize("ADMIN"), cc.getSeniorProfileById);
router.patch("/admin/senior-profiles/:id", authenticate, authorize("ADMIN"), cc.updateSeniorProfile);
router.delete("/admin/senior-profiles/:id", authenticate, authorize("ADMIN"), cc.deleteSeniorProfile);

export default router;
