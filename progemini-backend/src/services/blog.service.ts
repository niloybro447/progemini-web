import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/ApiError";
import minioService from "@/utils/minio";
import { optimizeImage } from "@/utils/imageOptimizer";
import { logger } from "@/utils/logger";

export interface CreateBlogDto {
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string | null;
  thumbnail?: string | null;
  author?: string;
  authorAvatar?: string | null;
  readMins?: number;
  tags?: string[];
  blocks?: any[];
  isPublished?: boolean;
  categoryId?: string | null;
  courseId?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[];
  canonicalUrl?: string | null;
}

export function sanitizeSlug(val: string): string {
  return val
    .trim()
    .toLowerCase()
    .replace(/['"’]/g, "")
    .replace(/\/+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function calculateReadMins(blocks: any[]): number {
  if (!Array.isArray(blocks) || blocks.length === 0) return 5;
  let text = "";
  try {
    for (const b of blocks) {
      if (b.type === "text" && typeof b.content === "string") {
        text += " " + b.content;
      } else if (b.type === "accordion" && Array.isArray(b.content)) {
        for (const item of b.content) {
          if (typeof item.title === "string") text += " " + item.title;
          if (typeof item.content === "string") text += " " + item.content;
        }
      } else if (b.type === "card" && Array.isArray(b.content)) {
        for (const item of b.content) {
          if (typeof item.title === "string") text += " " + item.title;
          if (typeof item.description === "string") text += " " + item.description;
        }
      } else if (b.type === "tabs" && Array.isArray(b.content)) {
        for (const item of b.content) {
          if (typeof item.title === "string") text += " " + item.title;
          if (typeof item.content === "string") text += " " + item.content;
        }
      }
    }
  } catch {
    // fallback
  }
  const plainText = text.replace(/<[^>]*>/g, " ");
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function buildFileUrl(slug: string): string {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/+$/, "");
  if (base && !base.includes("localhost") && !base.includes("127.0.0.1")) {
    const cleanBase = base.endsWith("/api") ? base.slice(0, -4) : base;
    return `${cleanBase}/api/files/download/${slug}`;
  }
  return `/api/files/download/${slug}`;
}

// ── Public Post Queries ──────────────────────────────────────────────

export async function getPublicBlogs(query: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  tag?: string;
}) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(50, Number(query.limit) || 9));
  const skip = (page - 1) * limit;

  const where: any = {
    isPublished: true,
  };

  if (query.category) {
    where.category = { slug: query.category };
  }

  if (query.tag) {
    where.tags = { has: query.tag };
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { excerpt: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [total, posts] = await Promise.all([
    prisma.blog.count({ where }),
    prisma.blog.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        thumbnail: true,
        author: true,
        authorAvatar: true,
        readMins: true,
        tags: true,
        publishedAt: true,
        createdAt: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
        course: {
          select: { id: true, title: true, slug: true, featureImage: true, duration: true, level: true, award: true },
        },
      },
    }),
  ]);

  return {
    posts,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getPublicBlogBySlug(slug: string) {
  const post = await prisma.blog.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    include: {
      category: true,
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          featureImage: true,
          duration: true,
          level: true,
          award: true,
          price: true,
          discountPrice: true,
          introduction: true,
        },
      },
    },
  });

  if (!post) {
    throw AppError.notFound("Blog post not found");
  }

  // Increment views in background
  prisma.blog.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  }).catch((err) => logger.error({ err }, "Failed to increment blog view count"));

  return post;
}

// ── Admin Post Queries ───────────────────────────────────────────────

export async function getAdminBlogs(query: {
  page?: number;
  limit?: number;
  status?: string;
  categoryId?: string;
  courseId?: string;
  search?: string;
}) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 15));
  const skip = (page - 1) * limit;

  const where: any = {};

  if (query.status === "published") {
    where.isPublished = true;
  } else if (query.status === "draft") {
    where.isPublished = false;
  }

  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }

  if (query.courseId) {
    where.courseId = query.courseId;
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { slug: { contains: query.search, mode: "insensitive" } },
      { excerpt: { contains: query.search, mode: "insensitive" } },
      { author: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [total, posts] = await Promise.all([
    prisma.blog.count({ where }),
    prisma.blog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        course: { select: { id: true, title: true, slug: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  return {
    posts,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getBlogById(id: string) {
  const post = await prisma.blog.findUnique({
    where: { id },
    include: {
      category: true,
      course: true,
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  if (!post) {
    throw AppError.notFound("Blog post not found");
  }

  return post;
}

export async function createBlogPost(userId: string, data: CreateBlogDto) {
  const slug = sanitizeSlug(data.slug || data.title);
  if (!slug) throw AppError.badRequest("Slug or Title is required to generate a valid URL slug");

  const existing = await prisma.blog.findUnique({ where: { slug } });
  if (existing) {
    throw AppError.conflict(`A blog post with slug "${slug}" already exists`);
  }

  const readMins = data.readMins || calculateReadMins(data.blocks || []);
  const isPublished = Boolean(data.isPublished);

  const post = await prisma.blog.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt || null,
      content: data.content || null,
      featuredImage: data.featuredImage || null,
      thumbnail: data.thumbnail || data.featuredImage || null,
      author: data.author || "Progemini Academy",
      authorAvatar: data.authorAvatar || null,
      readMins,
      tags: data.tags || [],
      blocks: data.blocks || [],
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      categoryId: data.categoryId || null,
      courseId: data.courseId || null,
      metaTitle: data.metaTitle || data.title,
      metaDescription: data.metaDescription || data.excerpt || null,
      metaKeywords: data.metaKeywords || data.tags || [],
      canonicalUrl: data.canonicalUrl || null,
      createdById: userId,
    },
    include: {
      category: true,
      course: true,
    },
  });

  return post;
}

export async function updateBlogPost(id: string, data: Partial<CreateBlogDto>) {
  const original = await prisma.blog.findUnique({ where: { id } });
  if (!original) throw AppError.notFound("Blog post not found");

  let slug = original.slug;
  if (data.slug && data.slug !== original.slug) {
    slug = sanitizeSlug(data.slug);
    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      throw AppError.conflict(`A blog post with slug "${slug}" already exists`);
    }
  }

  const isPublished = data.isPublished !== undefined ? Boolean(data.isPublished) : original.isPublished;
  let publishedAt = original.publishedAt;
  if (isPublished && !original.isPublished) {
    publishedAt = new Date();
  } else if (!isPublished) {
    publishedAt = null;
  }

  const blocks = data.blocks !== undefined ? data.blocks : (original.blocks as any[]);
  const readMins = data.readMins !== undefined ? data.readMins : calculateReadMins(blocks || []);

  const updated = await prisma.blog.update({
    where: { id },
    data: {
      title: data.title !== undefined ? data.title : original.title,
      slug,
      excerpt: data.excerpt !== undefined ? data.excerpt : original.excerpt,
      content: data.content !== undefined ? data.content : original.content,
      featuredImage: data.featuredImage !== undefined ? data.featuredImage : original.featuredImage,
      thumbnail: data.thumbnail !== undefined ? data.thumbnail : original.thumbnail,
      author: data.author !== undefined ? data.author : original.author,
      authorAvatar: data.authorAvatar !== undefined ? data.authorAvatar : original.authorAvatar,
      readMins,
      tags: data.tags !== undefined ? data.tags : original.tags,
      blocks: (data.blocks !== undefined ? data.blocks : (original.blocks as any)) as any,
      isPublished,
      publishedAt,
      categoryId: data.categoryId !== undefined ? data.categoryId : original.categoryId,
      courseId: data.courseId !== undefined ? data.courseId : original.courseId,
      metaTitle: data.metaTitle !== undefined ? data.metaTitle : original.metaTitle,
      metaDescription: data.metaDescription !== undefined ? data.metaDescription : original.metaDescription,
      metaKeywords: data.metaKeywords !== undefined ? data.metaKeywords : original.metaKeywords,
      canonicalUrl: data.canonicalUrl !== undefined ? data.canonicalUrl : original.canonicalUrl,
    },
    include: {
      category: true,
      course: true,
    },
  });

  return updated;
}

export async function togglePublishStatus(id: string, isPublished: boolean) {
  const original = await prisma.blog.findUnique({ where: { id } });
  if (!original) throw AppError.notFound("Blog post not found");

  const publishedAt = isPublished ? (original.publishedAt || new Date()) : null;

  return prisma.blog.update({
    where: { id },
    data: {
      isPublished,
      publishedAt,
    },
    include: {
      category: true,
      course: true,
    },
  });
}

export async function deleteBlogPost(id: string) {
  const original = await prisma.blog.findUnique({ where: { id } });
  if (!original) throw AppError.notFound("Blog post not found");

  await prisma.blog.delete({ where: { id } });
  return { success: true, message: "Blog post deleted successfully" };
}

// ── Categories ────────────────────────────────────────────────────────

export async function getBlogCategories() {
  return prisma.blogCategory.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: { blogs: true },
      },
    },
  });
}

export async function createBlogCategory(data: { name: string; slug?: string; description?: string; order?: number }) {
  const slug = sanitizeSlug(data.slug || data.name);
  if (!slug) throw AppError.badRequest("Valid slug or name is required");

  const existing = await prisma.blogCategory.findFirst({
    where: { OR: [{ slug }, { name: data.name }] },
  });
  if (existing) throw AppError.conflict("Category with this name or slug already exists");

  return prisma.blogCategory.create({
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      order: data.order ?? 0,
    },
  });
}

export async function updateBlogCategory(id: string, data: { name?: string; slug?: string; description?: string; order?: number }) {
  const cat = await prisma.blogCategory.findUnique({ where: { id } });
  if (!cat) throw AppError.notFound("Category not found");

  let slug = cat.slug;
  if (data.slug && data.slug !== cat.slug) {
    slug = sanitizeSlug(data.slug);
    const existing = await prisma.blogCategory.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      throw AppError.conflict("Category slug already taken");
    }
  }

  return prisma.blogCategory.update({
    where: { id },
    data: {
      name: data.name ?? cat.name,
      slug,
      description: data.description !== undefined ? data.description : cat.description,
      order: data.order ?? cat.order,
    },
  });
}

export async function deleteBlogCategory(id: string) {
  const cat = await prisma.blogCategory.findUnique({ where: { id } });
  if (!cat) throw AppError.notFound("Category not found");

  await prisma.blogCategory.delete({ where: { id } });
  return { success: true, message: "Category deleted successfully" };
}

// ── Blog Media / Image Upload with MinIO & Sharp Compression ──────────

export async function uploadBlogImage(file: Express.Multer.File) {
  if (!file) throw AppError.badRequest("No image file provided");
  if (file.size > 10 * 1024 * 1024) throw AppError.badRequest("Image file must be less than 10MB");

  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.mimetype)) {
    throw AppError.badRequest("Only JPEG, PNG, GIF or WebP images are accepted");
  }

  let uploadBuffer = file.buffer;
  let uploadMime = file.mimetype;
  let uploadName = file.originalname;

  // Compress non-GIF images to lightweight WebP with Sharp
  if (file.mimetype !== "image/gif") {
    const optimized = await optimizeImage(file.buffer, file.originalname, file.mimetype, {
      maxWidth: 1600,
      maxHeight: 1200,
      quality: 84,
      format: "webp",
    });
    uploadBuffer = optimized.buffer;
    uploadMime = optimized.mimeType;
    uploadName = optimized.originalName;
  }

  const { slug, size } = await minioService.uploadFile(
    uploadBuffer,
    uploadName,
    uploadMime,
    "blogs"
  );

  const fullUrl = buildFileUrl(slug);

  return {
    slug,
    url: fullUrl,
    size,
    fileName: uploadName,
  };
}
