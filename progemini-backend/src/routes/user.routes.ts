import { Router } from "express";
import { authenticate, authorize } from "@/middlewares/authenticate";
import { validate } from "@/middlewares/validate";
import { updateProfileSchema, createUserSchema, updateUserSchema } from "@/validations/user.schema";
import * as userController from "@/controllers/user.controller";

const router = Router();

// Profile routes (any authenticated user)
router.get("/profile", authenticate, userController.getProfile);
router.put("/profile", authenticate, validate(updateProfileSchema), userController.updateProfile);

// Admin-only user management routes
router.get("/", authenticate, authorize("ADMIN"), userController.listUsers);
router.post("/", authenticate, authorize("ADMIN"), validate(createUserSchema), userController.createUser);
router.get("/:id", authenticate, userController.getUserById);
router.patch("/:id", authenticate, validate(updateUserSchema), userController.updateUser);
router.delete("/:id", authenticate, authorize("ADMIN"), userController.deleteUser);

export default router;
