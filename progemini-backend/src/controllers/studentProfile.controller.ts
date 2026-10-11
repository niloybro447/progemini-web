import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import * as sps from "@/services/studentProfile.service";
import { StatusCodes } from "http-status-codes";

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await sps.getStudentProfile(req.user!.id);
  res.status(StatusCodes.OK).json({ success: true, profile });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const updated = await sps.updateStudentProfile(req.user!.id, req.body);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Profile updated successfully",
    profile: updated,
  });
});

export const adminUpdateProfile = asyncHandler(async (req: Request, res: Response) => {
  const updated = await sps.adminUpdateStudentProfile(req.params.userId, req.body);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Student profile updated by administrator",
    profile: updated,
  });
});

export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
  const result = await sps.uploadStudentAvatar(req.user!.id, req.file!);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Profile picture uploaded successfully",
    ...result,
  });
});

export const generateStudentId = asyncHandler(async (req: Request, res: Response) => {
  const result = await sps.generateDynamicStudentId({
    year: req.query.year as string,
    semester: req.query.semester as string,
    courseName: req.query.courseName as string,
    targetUserId: req.query.targetUserId as string,
  });
  res.status(StatusCodes.OK).json({
    success: true,
    ...result,
  });
});

export const verifyCredential = asyncHandler(async (req: Request, res: Response) => {
  const identifier = (req.params.studentId || req.query.id || req.params.id) as string;
  const result = await sps.verifyStudentCredential(identifier);
  if (!result.verified) {
    res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      ...result,
    });
    return;
  }
  res.status(StatusCodes.OK).json({
    success: true,
    ...result,
  });
});

export const sendProfileReminder = asyncHandler(async (req: Request, res: Response) => {
  const { prisma } = await import("@/config/prisma");
  const targetUserId = req.params.userId || req.params.id;
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: { studentProfile: true },
  });

  if (!user) {
    res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: "Student user not found",
    });
    return;
  }

  if (!user.email) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "User does not have a valid email address",
    });
    return;
  }

  const { sendProfileReminderEmail } = await import("@/utils/email");
  const customMessage = req.body?.message as string | undefined;
  const result = await sendProfileReminderEmail(
    user.email,
    user.name || "Student",
    customMessage
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Profile completion reminder email sent successfully to ${user.email}`,
    emailId: result.id,
  });
});


