import { Router } from "express";
import { authenticate, authorize } from "@/middlewares/authenticate";
import { upload } from "@/utils/multer";
import * as fc from "@/controllers/file.controller";

const router = Router();

router.post("/files", authenticate, upload.single("file"), fc.uploadFile);
router.get("/files", authenticate, fc.listFiles);
router.get("/files/cleanup", authenticate, authorize("ADMIN"), fc.getCleanupStatus);
router.post("/files/cleanup", authenticate, authorize("ADMIN"), fc.cleanupTempFiles);
router.post("/files/upload", authenticate, authorize("ADMIN"), upload.single("file"), fc.adminUploadFile);
router.get("/files/:id/download", fc.downloadFileById);
router.get("/files/download/*", fc.downloadFileBySlug);
router.get("/files/:id", authenticate, fc.getFileById);
router.put("/files/:id", authenticate, fc.updateFile);
router.delete("/files/:id", authenticate, fc.deleteFile);

export default router;
