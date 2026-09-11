import { Router } from "express";
import { authenticate, authorize } from "@/middlewares/authenticate";
import * as cc from "@/controllers/course.controller";

const router = Router();

// ─── Public Courses ────────────────────────────────────
router.get("/courses", cc.listCourses);
router.post("/courses", authenticate, authorize("ADMIN"), cc.createCourse);
router.get("/courses/slug/:slug", cc.getCourseBySlug);
router.get("/courses/:id", cc.getCourseById);
router.put("/courses/:id", authenticate, authorize("ADMIN"), cc.updateCourse);
router.delete("/courses/:id", authenticate, authorize("ADMIN"), cc.deleteCourse);

// ─── Admin Courses ─────────────────────────────────────
router.get("/admin/courses/featured-orders", authenticate, authorize("ADMIN"), cc.getFeaturedOrders);
router.get("/admin/courses", authenticate, authorize("ADMIN"), cc.listAdminCourses);
router.post("/admin/courses", authenticate, authorize("ADMIN"), cc.createAdminCourse);
router.get("/admin/courses/:id", authenticate, authorize("ADMIN"), cc.getAdminCourseById);
router.put("/admin/courses/:id", authenticate, authorize("ADMIN"), cc.updateAdminCourse);
router.delete("/admin/courses/:id", authenticate, authorize("ADMIN"), cc.deleteAdminCourse);
router.post("/admin/courses/:id/publish", authenticate, authorize("ADMIN"), cc.togglePublish);

// ─── Sections ──────────────────────────────────────────
router.get("/admin/courses/:id/sections", authenticate, authorize("ADMIN"), cc.listSections);
router.post("/admin/courses/:id/sections", authenticate, authorize("ADMIN"), cc.createSection);
router.put("/admin/courses/:id/sections/:sectionId", authenticate, authorize("ADMIN"), cc.updateSection);
router.delete("/admin/courses/:id/sections/:sectionId", authenticate, authorize("ADMIN"), cc.deleteSection);

// ─── Lectures ──────────────────────────────────────────
router.post("/admin/courses/:id/sections/:sectionId/lectures", authenticate, authorize("ADMIN"), cc.createLecture);
router.put("/admin/courses/:id/sections/:sectionId/lectures/:lectureId", authenticate, authorize("ADMIN"), cc.updateLecture);
router.delete("/admin/courses/:id/sections/:sectionId/lectures/:lectureId", authenticate, authorize("ADMIN"), cc.deleteLecture);

// ─── Study Sections ────────────────────────────────────
router.get("/admin/courses/:id/study-sections", authenticate, cc.listStudySections);
router.post("/admin/courses/:id/study-sections", authenticate, authorize("ADMIN"), cc.createStudySection);
router.get("/admin/courses/:id/study-sections/:sectionId", authenticate, cc.getStudySectionById);
router.put("/admin/courses/:id/study-sections/:sectionId", authenticate, authorize("ADMIN"), cc.updateStudySection);
router.delete("/admin/courses/:id/study-sections/:sectionId", authenticate, authorize("ADMIN"), cc.deleteStudySection);

// ─── Categories ────────────────────────────────────────
router.get("/categories", cc.listCategories);

// ─── Reviews ───────────────────────────────────────────
router.get("/reviews", cc.listReviews);
router.post("/reviews", authenticate, cc.createReview);

// ─── Enrollments ───────────────────────────────────────
router.get("/enrollments", authenticate, cc.listEnrollments);
router.post("/enrollments", authenticate, cc.createEnrollment);
router.get("/enrollments/:enrollmentId", authenticate, cc.getEnrollmentById);
router.post("/enrollments/:enrollmentId/progress", authenticate, cc.updateProgress);

export default router;
