import { Router } from "express";
import { validate } from "@/middlewares/validate";
import {
  signupSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/validations/auth.schema";
import * as authController from "@/controllers/auth.controller";

const router = Router();

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);
router.post("/verify-email", validate(verifyEmailSchema), authController.verifyEmail);
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);

export default router;
