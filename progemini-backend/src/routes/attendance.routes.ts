import { Router } from "express";
import { authenticate, authorize } from "@/middlewares/authenticate";
import * as ac from "@/controllers/attendance.controller";

const router = Router();

// ─── Student Attendance ────────────────────────────────
router.get("/student/attendance", authenticate, authorize("STUDENT"), ac.getStudentAttendance);

// ─── Admin Attendance Reports ──────────────────────────
router.get("/admin/attendance", authenticate, authorize("ADMIN"), ac.getAdminAttendance);

// ─── Admin Course Attendance ───────────────────────────
router.get("/admin/courses/:id/attendance", authenticate, authorize("ADMIN"), ac.getCourseAttendance);
router.post("/admin/courses/:id/attendance", authenticate, authorize("ADMIN"), ac.markAttendance);
router.put("/admin/courses/:id/attendance", authenticate, authorize("ADMIN"), ac.updateAttendanceRecord);

export default router;
