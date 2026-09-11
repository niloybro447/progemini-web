import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import * as cms from "@/services/cms.service";
import { StatusCodes } from "http-status-codes";

// ─── Consultants ───────────────────────────────────────

export const listConsultants = asyncHandler(async (req: Request, res: Response) => {
  const items = await cms.listConsultants(req.query.all === "1");
  res.status(StatusCodes.OK).json(items);
});

export const createConsultant = asyncHandler(async (req: Request, res: Response) => {
  const item = await cms.createConsultant(req.body);
  res.status(StatusCodes.CREATED).json(item);
});

export const getConsultantById = asyncHandler(async (req: Request, res: Response) => {
  const item = await cms.getConsultantById(req.params.id);
  res.status(StatusCodes.OK).json(item);
});

export const updateConsultant = asyncHandler(async (req: Request, res: Response) => {
  const item = await cms.updateConsultant(req.params.id, req.body);
  res.status(StatusCodes.OK).json(item);
});

export const deleteConsultant = asyncHandler(async (req: Request, res: Response) => {
  const result = await cms.deleteConsultant(req.params.id);
  res.status(StatusCodes.OK).json(result);
});

// ─── Academic Team ─────────────────────────────────────

export const listAcademicTeam = asyncHandler(async (req: Request, res: Response) => {
  const items = await cms.listAcademicTeam(req.query.all === "1");
  res.status(StatusCodes.OK).json(items);
});

export const createAcademicMember = asyncHandler(async (req: Request, res: Response) => {
  const item = await cms.createAcademicMember(req.body);
  res.status(StatusCodes.CREATED).json(item);
});

export const getAcademicMemberById = asyncHandler(async (req: Request, res: Response) => {
  const item = await cms.getAcademicMemberById(req.params.id);
  res.status(StatusCodes.OK).json(item);
});

export const updateAcademicMember = asyncHandler(async (req: Request, res: Response) => {
  const item = await cms.updateAcademicMember(req.params.id, req.body);
  res.status(StatusCodes.OK).json(item);
});

export const deleteAcademicMember = asyncHandler(async (req: Request, res: Response) => {
  const result = await cms.deleteAcademicMember(req.params.id);
  res.status(StatusCodes.OK).json(result);
});

// ─── Partner Universities ──────────────────────────────

export const listPartnerUniversities = asyncHandler(async (req: Request, res: Response) => {
  const items = await cms.listPartnerUniversities(req.query.all === "1");
  res.status(StatusCodes.OK).json(items);
});

export const createPartnerUniversity = asyncHandler(async (req: Request, res: Response) => {
  const item = await cms.createPartnerUniversity(req.body);
  res.status(StatusCodes.CREATED).json(item);
});

export const getPartnerUniversityById = asyncHandler(async (req: Request, res: Response) => {
  const item = await cms.getPartnerUniversityById(req.params.id);
  res.status(StatusCodes.OK).json(item);
});

export const updatePartnerUniversity = asyncHandler(async (req: Request, res: Response) => {
  const item = await cms.updatePartnerUniversity(req.params.id, req.body);
  res.status(StatusCodes.OK).json(item);
});

export const deletePartnerUniversity = asyncHandler(async (req: Request, res: Response) => {
  const result = await cms.deletePartnerUniversity(req.params.id);
  res.status(StatusCodes.OK).json(result);
});

// ─── Hero Slides ───────────────────────────────────────

export const listHeroSlides = asyncHandler(async (req: Request, res: Response) => {
  const items = await cms.listHeroSlides(req.query.all === "1");
  res.status(StatusCodes.OK).json(items);
});

export const getHeroSlideById = asyncHandler(async (req: Request, res: Response) => {
  const item = await cms.getHeroSlideById(req.params.id);
  res.status(StatusCodes.OK).json(item);
});

export const createHeroSlide = asyncHandler(async (req: Request, res: Response) => {
  const item = await cms.createHeroSlide(req.body);
  res.status(StatusCodes.CREATED).json(item);
});

export const updateHeroSlide = asyncHandler(async (req: Request, res: Response) => {
  const item = await cms.updateHeroSlide(req.params.id, req.body);
  res.status(StatusCodes.OK).json(item);
});

export const deleteHeroSlide = asyncHandler(async (req: Request, res: Response) => {
  const result = await cms.deleteHeroSlide(req.params.id);
  res.status(StatusCodes.OK).json(result);
});

// ─── Senior Profiles ───────────────────────────────────

export const listSeniorProfiles = asyncHandler(async (req: Request, res: Response) => {
  const items = await cms.listSeniorProfiles(req.query.all === "1");
  res.status(StatusCodes.OK).json(items);
});

export const getSeniorProfileById = asyncHandler(async (req: Request, res: Response) => {
  const item = await cms.getSeniorProfileById(req.params.id);
  res.status(StatusCodes.OK).json(item);
});

export const getSeniorProfileBySlug = asyncHandler(async (req: Request, res: Response) => {
  const item = await cms.getSeniorProfileBySlug(req.params.slug);
  res.status(StatusCodes.OK).json(item);
});

export const createSeniorProfile = asyncHandler(async (req: Request, res: Response) => {
  const item = await cms.createSeniorProfile(req.body);
  res.status(StatusCodes.CREATED).json(item);
});

export const updateSeniorProfile = asyncHandler(async (req: Request, res: Response) => {
  const item = await cms.updateSeniorProfile(req.params.id, req.body);
  res.status(StatusCodes.OK).json(item);
});

export const deleteSeniorProfile = asyncHandler(async (req: Request, res: Response) => {
  const result = await cms.deleteSeniorProfile(req.params.id);
  res.status(StatusCodes.OK).json(result);
});
