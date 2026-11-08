import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import * as blogService from "@/services/blog.service";
import { StatusCodes } from "http-status-codes";

// ── Public Controllers ───────────────────────────────────────────────

export const getPublicBlogs = asyncHandler(async (req: Request, res: Response) => {
  const result = await blogService.getPublicBlogs(req.query as any);
  res.status(StatusCodes.OK).json({ success: true, data: result });
});

export const getPublicBlogBySlug = asyncHandler(async (req: Request, res: Response) => {
  const post = await blogService.getPublicBlogBySlug(req.params.slug);
  res.status(StatusCodes.OK).json({ success: true, data: post });
});

export const getPublicCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await blogService.getBlogCategories();
  res.status(StatusCodes.OK).json({ success: true, data: categories });
});

// ── Admin Controllers ────────────────────────────────────────────────

export const getAdminBlogs = asyncHandler(async (req: Request, res: Response) => {
  const result = await blogService.getAdminBlogs(req.query as any);
  res.status(StatusCodes.OK).json({ success: true, data: result });
});

export const getBlogById = asyncHandler(async (req: Request, res: Response) => {
  const post = await blogService.getBlogById(req.params.id);
  res.status(StatusCodes.OK).json({ success: true, data: post });
});

export const createBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id || "";
  const post = await blogService.createBlogPost(userId, req.body);
  res.status(StatusCodes.CREATED).json({ success: true, data: post });
});

export const updateBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await blogService.updateBlogPost(req.params.id, req.body);
  res.status(StatusCodes.OK).json({ success: true, data: post });
});

export const togglePublishStatus = asyncHandler(async (req: Request, res: Response) => {
  const isPublished = Boolean(req.body.isPublished);
  const post = await blogService.togglePublishStatus(req.params.id, isPublished);
  res.status(StatusCodes.OK).json({ success: true, data: post });
});

export const deleteBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const result = await blogService.deleteBlogPost(req.params.id);
  res.status(StatusCodes.OK).json(result);
});

export const uploadBlogImage = asyncHandler(async (req: Request, res: Response) => {
  const result = await blogService.uploadBlogImage(req.file!);
  res.status(StatusCodes.CREATED).json({ success: true, data: result });
});

// Category Admin
export const getAdminCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await blogService.getBlogCategories();
  res.status(StatusCodes.OK).json({ success: true, data: categories });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await blogService.createBlogCategory(req.body);
  res.status(StatusCodes.CREATED).json({ success: true, data: category });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await blogService.updateBlogCategory(req.params.id, req.body);
  res.status(StatusCodes.OK).json({ success: true, data: category });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const result = await blogService.deleteBlogCategory(req.params.id);
  res.status(StatusCodes.OK).json(result);
});
