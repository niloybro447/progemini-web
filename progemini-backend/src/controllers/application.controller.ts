import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import * as appService from "@/services/application.service";
import { StatusCodes } from "http-status-codes";

// ─── Applications ──────────────────────────────────────

export const createApplication = asyncHandler(async (req: Request, res: Response) => {
  const result = await appService.createApplication(req.user!.id, req.body);
  res.status(StatusCodes.CREATED).json(result);
});

export const listApplications = asyncHandler(async (req: Request, res: Response) => {
  const result = await appService.listApplications(
    req.user!.id,
    req.user!.role,
    req.query.status as string | undefined,
    req.query.userId as string | undefined,
  );
  res.status(StatusCodes.OK).json(result);
});

export const getApplicationById = asyncHandler(async (req: Request, res: Response) => {
  const result = await appService.getApplicationById(req.user!.id, req.user!.role, req.params.id);
  res.status(StatusCodes.OK).json(result);
});

export const updateApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await appService.updateApplicationStatus(req.params.id, req.body, req.user!.id);
  res.status(StatusCodes.OK).json(result);
});

export const updateApplicationContent = asyncHandler(async (req: Request, res: Response) => {
  const result = await appService.updateApplicationContent(req.user!.id, req.params.id, req.body);
  res.status(StatusCodes.OK).json(result);
});

export const deleteApplication = asyncHandler(async (req: Request, res: Response) => {
  const result = await appService.deleteApplication(req.user!.id, req.user!.role, req.params.id);
  res.status(StatusCodes.OK).json(result);
});

export const checkApplication = asyncHandler(async (req: Request, res: Response) => {
  const result = await appService.checkApplication(req.user!.id, req.query.courseId as string);
  res.status(StatusCodes.OK).json(result);
});

// ─── Enquiries ─────────────────────────────────────────

export const createEnquiry = asyncHandler(async (req: Request, res: Response) => {
  const result = await appService.createEnquiry(req.body);
  res.status(StatusCodes.CREATED).json(result);
});

export const listEnquiries = asyncHandler(async (req: Request, res: Response) => {
  const result = await appService.listEnquiries(
    req.query.status as string | undefined,
    Number(req.query.page) || 1,
    Number(req.query.limit) || 20,
  );
  res.status(StatusCodes.OK).json(result);
});

export const getEnquiryById = asyncHandler(async (req: Request, res: Response) => {
  const result = await appService.getEnquiryById(req.params.id);
  res.status(StatusCodes.OK).json(result);
});

export const updateEnquiryStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await appService.updateEnquiryStatus(req.params.id, req.body.status);
  res.status(StatusCodes.OK).json(result);
});

export const deleteEnquiry = asyncHandler(async (req: Request, res: Response) => {
  const result = await appService.deleteEnquiry(req.params.id);
  res.status(StatusCodes.OK).json(result);
});

// ─── Contact (stub) ────────────────────────────────────

export const handleContactForm = asyncHandler(async (req: Request, res: Response) => {
  const result = await appService.handleContactForm(req.body);
  res.status(StatusCodes.OK).json(result);
});
