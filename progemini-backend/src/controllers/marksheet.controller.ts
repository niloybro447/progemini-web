import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "http-status-codes";
import * as ms from "@/services/marksheet.service";
import { prisma } from "@/config/prisma";

export const getUserMarksheets = asyncHandler(async (req: Request, res: Response) => {
  const targetUserId = req.params.userId || (req.query.userId as string) || req.user!.id;
  const isStudent = req.user?.role === "STUDENT";
  const effectiveUserId = isStudent ? req.user!.id : targetUserId;

  // If student is querying, check that their certificate is published
  if (isStudent) {
    const publishedCert = await prisma.certificate.findFirst({
      where: { userId: effectiveUserId, status: "PUBLISHED" },
    });
    if (!publishedCert) {
      res.status(StatusCodes.OK).json({
        success: true,
        data: [],
        message: "Final Progress is not achieved",
      });
      return;
    }
  }

  const marksheets = await ms.getUserMarksheets(effectiveUserId);
  res.status(StatusCodes.OK).json({
    success: true,
    data: marksheets,
  });
});

export const getMarksheet = asyncHandler(async (req: Request, res: Response) => {
  const marksheet = await ms.getMarksheetById(req.params.id);
  if (!marksheet) {
    res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: "Marksheet not found",
    });
    return;
  }

  // If student, ensure it belongs to them and certificate is published
  if (req.user?.role === "STUDENT") {
    if (marksheet.userId !== req.user.id) {
      res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "Access denied.",
      });
      return;
    }
    const publishedCert = await prisma.certificate.findFirst({
      where: { userId: req.user.id, status: "PUBLISHED" },
    });
    if (!publishedCert) {
      res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "Final Progress is not achieved.",
      });
      return;
    }
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: marksheet,
  });
});

export const upsertMarksheet = asyncHandler(async (req: Request, res: Response) => {
  const result = await ms.upsertMarksheet(req.body);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Marksheet saved successfully",
    data: result,
  });
});

export const deleteMarksheet = asyncHandler(async (req: Request, res: Response) => {
  const result = await ms.deleteMarksheet(req.params.id);
  res.status(StatusCodes.OK).json(result);
});

export const downloadMarksheetPdf = asyncHandler(async (req: Request, res: Response) => {
  const marksheet = await ms.getMarksheetById(req.params.id);
  if (!marksheet) {
    res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: "Marksheet not found",
    });
    return;
  }

  if (req.user?.role === "STUDENT") {
    if (marksheet.userId !== req.user.id) {
      res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "Access denied.",
      });
      return;
    }
    const publishedCert = await prisma.certificate.findFirst({
      where: { userId: req.user.id, status: "PUBLISHED" },
    });
    if (!publishedCert) {
      res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: "Final Progress is not achieved.",
      });
      return;
    }
  }

  const { generateMarksheetHtml, renderHtmlToPdf } = await import("@/services/pdf.service");
  const studentName = marksheet.user?.name || "Student";
  const studentId = marksheet.studentId || marksheet.user?.studentProfile?.studentId || "PG4673109";
  const html = await generateMarksheetHtml({
    studentName,
    studentId,
    qualification: marksheet.courseTitle,
    mainFieldOfStudy: marksheet.mainFieldOfStudy || "Business Studies",
    level: marksheet.level || "Level 6 - Bachelor's Degree",
    language: marksheet.language || "English",
    modeOfStudy: marksheet.modeOfStudy || "Online / Campus",
    programmeLength: marksheet.programmeLength || "3 Years",
    creditRequirement: marksheet.creditRequirement || "120 UK Credits / 60 ECTS Credits",
    overallAverage: marksheet.overallAverage || undefined,
    classification: marksheet.classification || undefined,
    totalUkCredits: marksheet.totalUkCredits ?? undefined,
    totalEctsCredits: marksheet.totalEctsCredits ?? undefined,
    issueDate: marksheet.issueDate,
    modules: (marksheet.modules as any) || [],
  });

  const pdfBuffer = await renderHtmlToPdf(html);
  const cleanName = studentName.replace(/[^a-zA-Z0-9_-]/g, "_");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${cleanName}_Official_Mark_Sheet_Progemini.pdf"`
  );
  res.setHeader("Content-Length", pdfBuffer.length);
  res.end(pdfBuffer);
});

export const renderMarksheetPdfFromData = asyncHandler(async (req: Request, res: Response) => {
  const { generateMarksheetHtml, renderHtmlToPdf } = await import("@/services/pdf.service");
  const data = req.body;
  const studentName = data.studentName || "Student";
  const html = await generateMarksheetHtml(data);
  const pdfBuffer = await renderHtmlToPdf(html);
  const cleanName = studentName.replace(/[^a-zA-Z0-9_-]/g, "_");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${cleanName}_Official_Mark_Sheet_Progemini.pdf"`
  );
  res.setHeader("Content-Length", pdfBuffer.length);
  res.end(pdfBuffer);
});

