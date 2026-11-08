import { Router } from "express";
import { authenticate, authorize } from "@/middlewares/authenticate";
import { upload } from "@/utils/multer";
import * as bc from "@/controllers/blog.controller";

const router = Router();

// ── Public Blog Endpoints ────────────────────────────────────────────
router.get("/blogs", bc.getPublicBlogs);
router.get("/blogs/:slug", bc.getPublicBlogBySlug);
router.get("/blog-categories", bc.getPublicCategories);

// ── Admin Blog Endpoints ─────────────────────────────────────────────
router.use("/admin/blogs", authenticate, authorize("ADMIN"));

// Categories management
router.get("/admin/blogs/categories", bc.getAdminCategories);
router.post("/admin/blogs/categories", bc.createCategory);
router.put("/admin/blogs/categories/:id", bc.updateCategory);
router.delete("/admin/blogs/categories/:id", bc.deleteCategory);

// Media upload for blog content & featured image
router.post("/admin/blogs/upload-image", upload.single("file"), bc.uploadBlogImage);

// Blog posts CRUD
router.get("/admin/blogs", bc.getAdminBlogs);
router.post("/admin/blogs", bc.createBlogPost);
router.get("/admin/blogs/:id", bc.getBlogById);
router.put("/admin/blogs/:id", bc.updateBlogPost);
router.patch("/admin/blogs/:id/publish", bc.togglePublishStatus);
router.delete("/admin/blogs/:id", bc.deleteBlogPost);

export default router;

