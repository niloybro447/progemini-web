import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/ApiError";
import minioService from "@/utils/minio";
import { logger } from "@/utils/logger";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const ALLOWED_MIMES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function uploadFile(
  userId: string,
  file: Express.Multer.File,
  options: { fileType?: string; applicationId?: string; isTemporary?: string },
) {
  if (!file) throw AppError.badRequest("No file provided");
  if (file.size > 10 * 1024 * 1024) throw AppError.badRequest("File size must be less than 10MB");
  if (!ALLOWED_MIMES.has(file.mimetype)) {
    throw AppError.badRequest("Invalid file type. Allowed: PDF, JPEG, JPG, PNG, WebP, DOC, DOCX");
  }

  const targetBucket = process.env.MINIO_BUCKET_NAME || "progemini-main-website-files";
  const { slug, size } = await minioService.uploadFile(file.buffer, file.originalname, file.mimetype, "application", targetBucket);

  const fileRecord = await prisma.file.create({
    data: {
      fileName: file.originalname.split(".")[0],
      originalName: file.originalname,
      slug,
      fullUrl: `${API_BASE}/api/v1/files/download/${slug}`,
      fileType: (options.fileType as "ADMISSION_DOCUMENT" | "PROFILE_PICTURE" | "CERTIFICATE" | "OTHER") || "ADMISSION_DOCUMENT",
      mimeType: file.mimetype,
      fileSize: size,
      bucketName: targetBucket,
      isTemporary: options.isTemporary === "true",
      uploadedById: userId,
      applicationId: options.applicationId || null,
    },
  });

  return {
    id: fileRecord.id,
    fileName: fileRecord.fileName,
    originalName: fileRecord.originalName,
    fullUrl: fileRecord.fullUrl,
    slug: fileRecord.slug,
    fileType: fileRecord.fileType,
    mimeType: fileRecord.mimeType,
    fileSize: fileRecord.fileSize,
    uploadedAt: fileRecord.uploadedAt,
    isTemporary: fileRecord.isTemporary,
  };
}

export async function listFiles(userId: string, role: string, query: { applicationId?: string; fileType?: string; onlyMyFiles?: string }) {
  const where: Record<string, unknown> = {};
  if (query.applicationId) where.applicationId = query.applicationId;
  if (query.fileType) where.fileType = query.fileType;
  if (query.onlyMyFiles === "true" || role !== "ADMIN") where.uploadedById = userId;

  return prisma.file.findMany({
    where,
    include: {
      uploadedBy: { select: { name: true, email: true } },
      application: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { uploadedAt: "desc" },
  });
}

export async function getFileById(userId: string, role: string, fileId: string) {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    include: {
      uploadedBy: { select: { name: true, email: true } },
      application: { select: { id: true, firstName: true, lastName: true } },
    },
  });
  if (!file) throw AppError.notFound("File not found");
  if (file.uploadedById !== userId && role !== "ADMIN") throw AppError.forbidden("Forbidden");

  await prisma.file.update({ where: { id: fileId }, data: { lastAccessedAt: new Date() } });
  return { ...file, fullUrl: `${API_BASE}/api/v1/files/download/${file.slug}` };
}

export async function updateFile(userId: string, role: string, fileId: string, data: { fileName?: string; fileType?: string; applicationId?: string | null }) {
  const file = await prisma.file.findUnique({ where: { id: fileId } });
  if (!file) throw AppError.notFound("File not found");
  if (file.uploadedById !== userId && role !== "ADMIN") throw AppError.forbidden("Forbidden");

  const updateData: Record<string, unknown> = { isTemporary: false };
  if (data.fileName !== undefined) updateData.fileName = data.fileName;
  if (data.fileType !== undefined) updateData.fileType = data.fileType;
  if (data.applicationId !== undefined) updateData.applicationId = data.applicationId;

  return prisma.file.update({
    where: { id: fileId },
    data: updateData as never,
    include: {
      uploadedBy: { select: { name: true, email: true } },
      application: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function deleteFile(userId: string, role: string, fileId: string) {
  const file = await prisma.file.findUnique({ where: { id: fileId } });
  if (!file) throw AppError.notFound("File not found");
  if (file.uploadedById !== userId && role !== "ADMIN") throw AppError.forbidden("Forbidden");

  try {
    await minioService.deleteFile(file.slug, file.bucketName);
  } catch (err) {
    logger.error({ err }, "Failed to delete file from MinIO");
  }

  await prisma.file.delete({ where: { id: fileId } });
  return { success: true, message: "File deleted successfully" };
}

export async function downloadFileBySlug(slug: string) {
  const result = await minioService.getFileStream(slug);
  if (!result) throw AppError.notFound("File not found");
  return result;
}

export async function adminUploadFile(file: Express.Multer.File, folder?: string) {
  if (!file) throw AppError.badRequest("No file provided");
  if (file.size > 10 * 1024 * 1024) throw AppError.badRequest("File size must be less than 10MB");
  if (!ALLOWED_MIMES.has(file.mimetype)) {
    throw AppError.badRequest("Invalid file type");
  }

  const { slug, size } = await minioService.uploadFile(file.buffer, file.originalname, file.mimetype, folder);
  return {
    slug,
    size,
    fileName: file.originalname,
    downloadUrl: `${API_BASE}/api/v1/files/download/${slug}`,
  };
}

export async function cleanupTempFiles(_apiKey?: string) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const tempFiles = await prisma.file.findMany({
    where: { isTemporary: true, uploadedAt: { lt: oneDayAgo } },
  });

  let deleted = 0;
  const errors: string[] = [];

  for (const file of tempFiles) {
    try {
      await minioService.deleteFile(file.slug, file.bucketName);
      await prisma.file.delete({ where: { id: file.id } });
      deleted++;
    } catch (err) {
      errors.push(`${file.slug}: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }

  return {
    success: true,
    message: `Cleanup completed: ${deleted} files deleted`,
    totalFound: tempFiles.length,
    deleted,
    ...(errors.length > 0 ? { errors } : {}),
  };
}

export async function getCleanupStatus() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalFiles, tempTotal, tempOlderThan24h, tempOlderThan7d] = await Promise.all([
    prisma.file.count(),
    prisma.file.count({ where: { isTemporary: true } }),
    prisma.file.count({ where: { isTemporary: true, uploadedAt: { lt: oneDayAgo } } }),
    prisma.file.count({ where: { isTemporary: true, uploadedAt: { lt: sevenDaysAgo } } }),
  ]);

  return {
    cleanup: {
      totalFiles,
      temporaryFiles: { total: tempTotal, olderThan24h: tempOlderThan24h, olderThan7d: tempOlderThan7d },
      recommendation: tempOlderThan24h > 0 ? "Cleanup recommended" : "No cleanup needed",
    },
  };
}
