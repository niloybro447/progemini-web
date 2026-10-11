import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { StatusCodes } from "http-status-codes";
import * as cs from "@/services/certificate.service";

/**
 * Get certificates for a user.
 * Admin can get certificates for any user;
 * Student can only get their own published certificates.
 */
export const getUserCertificates = asyncHandler(async (req: Request, res: Response) => {
  const targetUserId = req.params.userId || (req.query.userId as string) || req.user!.id;
  const isStudent = req.user!.role === "STUDENT";

  // If student is requesting, enforce that they only query their own
  const effectiveUserId = isStudent ? req.user!.id : targetUserId;

  const certificates = await cs.getUserCertificates(effectiveUserId, isStudent);
  res.status(StatusCodes.OK).json({
    success: true,
    data: certificates,
  });
});

/**
 * Admin: Get all certificates across all students
 */
export const getAllCertificates = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string;
  const certificates = await cs.getAllCertificates(status);
  res.status(StatusCodes.OK).json({
    success: true,
    data: certificates,
  });
});

/**
 * Get a single certificate
 */
export const getCertificate = asyncHandler(async (req: Request, res: Response) => {
  const certificate = await cs.getCertificateById(req.params.id);
  if (!certificate) {
    res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: "Certificate not found",
    });
    return;
  }

  // If student, only allow viewing published certificate
  if (req.user!.role === "STUDENT" && certificate.status !== "PUBLISHED") {
    res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: "Access denied. Certificate not yet published.",
    });
    return;
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: certificate,
  });
});

/**
 * Generate a candidate certificate ID (e.g. PG4673109)
 */
export const generateCertificateId = asyncHandler(async (_req: Request, res: Response) => {
  const certificateId = await cs.generateUniqueCertificateId();
  res.status(StatusCodes.OK).json({
    success: true,
    certificateId,
  });
});

/**
 * Admin: Create or update certificate
 */
export const upsertCertificate = asyncHandler(async (req: Request, res: Response) => {
  const result = await cs.upsertCertificate(req.body, req.user!.id);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Certificate saved successfully",
    data: result,
  });
});

/**
 * Admin: Publish Certificate
 */
export const publishCertificate = asyncHandler(async (req: Request, res: Response) => {
  const result = await cs.publishCertificate(req.params.id, req.user!.id);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Certificate published successfully and student marked as Certified!",
    data: result,
  });
});

/**
 * Admin: Unpublish Certificate (revert to DRAFT)
 */
export const unpublishCertificate = asyncHandler(async (req: Request, res: Response) => {
  const result = await cs.unpublishCertificate(req.params.id);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Certificate unpublished and reverted to draft status.",
    data: result,
  });
});

/**
 * Admin: Delete Certificate
 */
export const deleteCertificate = asyncHandler(async (req: Request, res: Response) => {
  const result = await cs.deleteCertificate(req.params.id);
  res.status(StatusCodes.OK).json(result);
});

/**
 * Public: Verify Certificate via encrypted token or ID
 */
export const verifyCertificate = asyncHandler(async (req: Request, res: Response) => {
  const token =
    (req.params.token || req.query.token || req.query.id || req.params.id) as string;

  const result = await cs.verifyCertificate(token);
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

/**
 * Download Certificate PDF by ID
 */
export const downloadCertificatePdf = asyncHandler(async (req: Request, res: Response) => {
  const certificate = await cs.getCertificateById(req.params.id);
  if (!certificate) {
    res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: "Certificate not found",
    });
    return;
  }

  // If student, only allow downloading published certificate
  if (req.user!.role === "STUDENT" && certificate.status !== "PUBLISHED") {
    res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: "Access denied. Certificate not yet published.",
    });
    return;
  }

  const { generateCertificateHtml, renderHtmlToPdf } = await import("@/services/pdf.service");
  const studentName = certificate.studentName || certificate.user?.name || "Student";
  const html = await generateCertificateHtml({
    studentName,
    courseTitle: certificate.courseTitle,
    grade: certificate.grade,
    issueDate: certificate.issueDate,
    learningHours: certificate.learningHours,
    studentId: certificate.certificateId,
    certificateId: certificate.certificateId,
    encryptedToken: certificate.encryptedToken,
    verificationUrl: certificate.verificationUrl,
  });

  const pdfBuffer = await renderHtmlToPdf(html);
  const safeName = studentName.replace(/[^a-zA-Z0-9_-]/g, "_");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="Progemini_Certificate_${safeName}.pdf"`
  );
  res.setHeader("Content-Length", pdfBuffer.length);
  res.end(pdfBuffer);
});

/**
 * Render and download Certificate PDF directly from request body (Admin live preview or download)
 */
export const renderCertificatePdfFromData = asyncHandler(async (req: Request, res: Response) => {
  const { generateCertificateHtml, renderHtmlToPdf } = await import("@/services/pdf.service");
  const data = req.body;
  const studentName = data.studentName || "Student";
  const html = await generateCertificateHtml(data);
  const pdfBuffer = await renderHtmlToPdf(html);
  const safeName = studentName.replace(/[^a-zA-Z0-9_-]/g, "_");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="Progemini_Certificate_${safeName}.pdf"`
  );
  res.setHeader("Content-Length", pdfBuffer.length);
  res.end(pdfBuffer);
});

