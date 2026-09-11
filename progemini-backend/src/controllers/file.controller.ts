import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import * as fileService from "@/services/file.service";
import { StatusCodes } from "http-status-codes";

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  const result = await fileService.uploadFile(req.user!.id, req.file!, {
    fileType: req.body.fileType,
    applicationId: req.body.applicationId,
    isTemporary: req.body.isTemporary,
  });
  res.status(StatusCodes.CREATED).json({ success: true, file: result });
});

export const listFiles = asyncHandler(async (req: Request, res: Response) => {
  const files = await fileService.listFiles(req.user!.id, req.user!.role, req.query as { applicationId?: string; fileType?: string; onlyMyFiles?: string });
  res.status(StatusCodes.OK).json({ files });
});

export const getFileById = asyncHandler(async (req: Request, res: Response) => {
  const file = await fileService.getFileById(req.user!.id, req.user!.role, req.params.id);
  res.status(StatusCodes.OK).json(file);
});

export const updateFile = asyncHandler(async (req: Request, res: Response) => {
  const file = await fileService.updateFile(req.user!.id, req.user!.role, req.params.id, req.body);
  res.status(StatusCodes.OK).json({ file });
});

export const deleteFile = asyncHandler(async (req: Request, res: Response) => {
  const result = await fileService.deleteFile(req.user!.id, req.user!.role, req.params.id);
  res.status(StatusCodes.OK).json(result);
});

export const downloadFileById = asyncHandler(async (req: Request, res: Response) => {
  const result = await fileService.downloadFileBySlug(req.params.id);
  if (!result) {
    res.status(StatusCodes.NOT_FOUND).json({ error: "File not found" });
    return;
  }
  res.setHeader("Content-Type", result.mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${req.params.id}"`);
  res.setHeader("Cache-Control", "public, max-age=31536000");
  (result.stream as unknown as NodeJS.ReadableStream).pipe(res);
});

export const downloadFileBySlug = asyncHandler(async (req: Request, res: Response) => {
  const slug = (req.params.slug as unknown as string[]).map(encodeURIComponent).join("/");
  const result = await fileService.downloadFileBySlug(slug);
  if (!result) {
    res.status(StatusCodes.NOT_FOUND).json({ error: "File not found" });
    return;
  }
  res.setHeader("Content-Type", result.mimeType);
  const filename = slug.split("/").pop() || "file";
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  (result.stream as unknown as NodeJS.ReadableStream).pipe(res);
});

export const adminUploadFile = asyncHandler(async (req: Request, res: Response) => {
  const result = await fileService.adminUploadFile(req.file!, req.body.folder);
  res.status(StatusCodes.CREATED).json(result);
});

export const cleanupTempFiles = asyncHandler(async (req: Request, res: Response) => {
  const apiKey = req.headers["x-api-key"] as string | undefined;
  const result = await fileService.cleanupTempFiles(apiKey);
  res.status(StatusCodes.OK).json(result);
});

export const getCleanupStatus = asyncHandler(async (_req: Request, res: Response) => {
  const result = await fileService.getCleanupStatus();
  res.status(StatusCodes.OK).json(result);
});
