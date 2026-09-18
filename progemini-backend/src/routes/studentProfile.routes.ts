import { Router } from "express";
import { authenticate, authorize } from "@/middlewares/authenticate";
import { validate } from "@/middlewares/validate";
import { upload } from "@/utils/multer";
import {
  updateStudentProfileSchema,
  adminUpdateStudentProfileSchema,
} from "@/validations/studentProfile.schema";
import * as spc from "@/controllers/studentProfile.controller";

const router = Router();

// Student Profile endpoints (Authenticated user)
router.get("/profile", authenticate, spc.getProfile);
router.put("/profile", authenticate, validate(updateStudentProfileSchema), spc.updateProfile);
router.post("/profile/avatar", authenticate, upload.single("file"), spc.uploadAvatar);

// Admin-only Student Profile management endpoints
router.get(
  "/admin/students/generate-id",
  authenticate,
  authorize("ADMIN"),
  spc.generateStudentId,
);

router.patch(
  "/admin/students/:userId/profile",
  authenticate,
  authorize("ADMIN"),
  validate(adminUpdateStudentProfileSchema),
  spc.adminUpdateProfile,
);

export default router;
