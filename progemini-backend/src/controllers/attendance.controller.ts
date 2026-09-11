import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import * as att from "@/services/attendance.service";
import { StatusCodes } from "http-status-codes";

// ─── Student Attendance ────────────────────────────────

export const getStudentAttendance = asyncHandler(async (req: Request, res: Response) => {
  const result = await att.getStudentAttendance(req.user!.id, req.query as { courseId?: string; studySectionId?: string; startDate?: string; endDate?: string });
  res.status(StatusCodes.OK).json(result);
});

// ─── Admin Attendance Reports ──────────────────────────

export const getAdminAttendance = asyncHandler(async (req: Request, res: Response) => {
  const result = await att.getAdminAttendance(req.query as { courseId?: string; startDate?: string; endDate?: string });
  res.status(StatusCodes.OK).json(result);
});

// ─── Admin Course Attendance ───────────────────────────

export const getCourseAttendance = asyncHandler(async (req: Request, res: Response) => {
  const result = await att.getCourseAttendance(req.params.id, req.query as { date?: string; startDate?: string; endDate?: string; studySectionId?: string });
  res.status(StatusCodes.OK).json(result);
});

export const markAttendance = asyncHandler(async (req: Request, res: Response) => {
  const result = await att.markAttendance(req.params.id, req.body, req.user!.id);
  res.status(StatusCodes.OK).json(result);
});

export const updateAttendanceRecord = asyncHandler(async (req: Request, res: Response) => {
  const result = await att.updateAttendanceRecord(req.body.attendanceId, { status: req.body.status, notes: req.body.notes });
  res.status(StatusCodes.OK).json(result);
});
