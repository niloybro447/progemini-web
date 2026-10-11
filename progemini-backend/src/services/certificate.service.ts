import { prisma } from "@/config/prisma";
import { ApiError } from "@/utils/ApiError";
import { encryptPayload, decryptPayload } from "@/utils/crypto";
import { StatusCodes } from "http-status-codes";

export interface UpsertCertificateInput {
  id?: string;
  userId: string;
  studentName: string;
  courseTitle: string;
  grade?: string | null;
  issueDate: string | Date;
  learningHours?: string | null;
  certificateId?: string | null;
  status?: "DRAFT" | "PUBLISHED" | "REVOKED";
}

/**
 * Generate a unique Certificate ID like "PG4673109"
 */
export async function generateUniqueCertificateId(): Promise<string> {
  let unique = false;
  let certId = "";
  let attempts = 0;

  while (!unique && attempts < 15) {
    attempts++;
    const random7 = Math.floor(1000000 + Math.random() * 9000000);
    certId = `PG${random7}`;
    const existing = await prisma.certificate.findUnique({
      where: { certificateId: certId },
    });
    if (!existing) {
      unique = true;
    }
  }

  return certId;
}

/**
 * Determine live domain for official certificate verification
 */
function getVerificationBaseUrl(): string {
  const live = process.env.NEXT_PUBLIC_LIVE_URL || "https://progemini.academy";
  return live.replace(/\/+$/, "");
}

/**
 * Get all certificates across all students (Admin).
 */
export async function getAllCertificates(status?: string) {
  const where: any = {};
  if (status && status !== "ALL") {
    where.status = status;
  }

  const certificates = await prisma.certificate.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          studentProfile: {
            select: {
              studentId: true,
              program: true,
              isCertified: true,
              certifiedAt: true,
            },
          },
        },
      },
    },
  });

  return certificates;
}

/**
 * Get all certificates for a user.
 * If userId is 'all', returns all certificates.
 * If isStudent is true, return only PUBLISHED certificates.
 */
export async function getUserCertificates(userId: string, isStudent = false) {
  if (userId === "all") {
    return await getAllCertificates(isStudent ? "PUBLISHED" : undefined);
  }

  const where: any = { userId };
  if (isStudent) {
    where.status = "PUBLISHED";
  }

  const certificates = await prisma.certificate.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          studentProfile: {
            select: {
              studentId: true,
              program: true,
              isCertified: true,
              certifiedAt: true,
            },
          },
        },
      },
    },
  });

  return certificates;
}

/**
 * Get single certificate by ID or certificateId
 */
export async function getCertificateById(idOrCertId: string) {
  const certificate = await prisma.certificate.findFirst({
    where: {
      OR: [{ id: idOrCertId }, { certificateId: idOrCertId }],
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          studentProfile: true,
        },
      },
    },
  });

  return certificate;
}

/**
 * Create or Update Certificate
 */
export async function upsertCertificate(input: UpsertCertificateInput, adminUserId?: string) {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    include: { studentProfile: true },
  });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  const studentId = user.studentProfile?.studentId || null;
  // Ensure certificate uniqueness through the student ID (institutional serial)
  const certificateId = studentId || input.certificateId?.trim() || (await generateUniqueCertificateId());

  const parsedIssueDate = new Date(input.issueDate);
  const status = input.status || "DRAFT";

  // Create compact encrypted token (only the studentId/certificateId string)
  // This produces an ultra-compact ~45 character token that fits in a scannable Version 4 QR code
  const encryptedToken = encryptPayload(studentId || certificateId);
  const baseUrl = getVerificationBaseUrl();
  const verificationUrl = `${baseUrl}/credentials/verify?token=${encodeURIComponent(encryptedToken)}`;

  let certificate;

  if (input.id) {
    // Update existing certificate
    certificate = await prisma.certificate.update({
      where: { id: input.id },
      data: {
        certificateId,
        studentId,
        studentName: input.studentName.trim(),
        courseTitle: input.courseTitle.trim(),
        grade: input.grade?.trim() || null,
        issueDate: parsedIssueDate,
        learningHours: input.learningHours?.trim() || "As per programme",
        status,
        encryptedToken,
        verificationUrl,
        ...(status === "PUBLISHED"
          ? {
              publishedAt: new Date(),
              publishedBy: adminUserId || null,
            }
          : {}),
      },
    });
  } else {
    // Check if certificate with certificateId already exists
    const existing = await prisma.certificate.findUnique({
      where: { certificateId },
    });

    if (existing) {
      certificate = await prisma.certificate.update({
        where: { id: existing.id },
        data: {
          studentId,
          studentName: input.studentName.trim(),
          courseTitle: input.courseTitle.trim(),
          grade: input.grade?.trim() || null,
          issueDate: parsedIssueDate,
          learningHours: input.learningHours?.trim() || "As per programme",
          status,
          encryptedToken,
          verificationUrl,
          ...(status === "PUBLISHED"
            ? {
                publishedAt: new Date(),
                publishedBy: adminUserId || null,
              }
            : {}),
        },
      });
    } else {
      certificate = await prisma.certificate.create({
        data: {
          certificateId,
          userId: user.id,
          studentId,
          studentName: input.studentName.trim(),
          courseTitle: input.courseTitle.trim(),
          grade: input.grade?.trim() || null,
          issueDate: parsedIssueDate,
          learningHours: input.learningHours?.trim() || "As per programme",
          status,
          encryptedToken,
          verificationUrl,
          ...(status === "PUBLISHED"
            ? {
                publishedAt: new Date(),
                publishedBy: adminUserId || null,
              }
            : {}),
        },
      });
    }
  }

  // Synchronize studentProfile certification status
  if (status === "PUBLISHED") {
    if (user.studentProfile) {
      await prisma.studentProfile.update({
        where: { id: user.studentProfile.id },
        data: {
          isCertified: true,
          certifiedAt: new Date(),
        },
      });
    }
  }

  return certificate;
}

/**
 * Publish Certificate & mark student as certified
 */
export async function publishCertificate(id: string, adminUserId: string) {
  const existing = await prisma.certificate.findUnique({
    where: { id },
    include: {
      user: {
        include: { studentProfile: true },
      },
    },
  });

  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Certificate not found");
  }

  const now = new Date();

  // Compact encrypted token representing the studentId/certificateId
  const certCode = existing.studentId || existing.certificateId;
  const encryptedToken = encryptPayload(certCode);
  const baseUrl = getVerificationBaseUrl();
  const verificationUrl = `${baseUrl}/credentials/verify?token=${encodeURIComponent(encryptedToken)}`;

  const updatedCert = await prisma.certificate.update({
    where: { id },
    data: {
      status: "PUBLISHED",
      publishedAt: now,
      publishedBy: adminUserId,
      encryptedToken,
      verificationUrl,
    },
  });

  // Update studentProfile.isCertified
  if (existing.user.studentProfile) {
    await prisma.studentProfile.update({
      where: { id: existing.user.studentProfile.id },
      data: {
        isCertified: true,
        certifiedAt: now,
      },
    });
  }

  return updatedCert;
}

/**
 * Unpublish Certificate (revert to DRAFT)
 */
export async function unpublishCertificate(id: string) {
  const existing = await prisma.certificate.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          studentProfile: true,
          certificates: true,
        },
      },
    },
  });

  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Certificate not found");
  }

  const updatedCert = await prisma.certificate.update({
    where: { id },
    data: {
      status: "DRAFT",
    },
  });

  // Check if any remaining published certificates exist for this user
  const remainingPublished = await prisma.certificate.count({
    where: {
      userId: existing.userId,
      status: "PUBLISHED",
    },
  });

  if (remainingPublished === 0 && existing.user.studentProfile) {
    await prisma.studentProfile.update({
      where: { id: existing.user.studentProfile.id },
      data: {
        isCertified: false,
      },
    });
  }

  return updatedCert;
}

/**
 * Delete Certificate
 */
export async function deleteCertificate(id: string) {
  const existing = await prisma.certificate.findUnique({
    where: { id },
    include: {
      user: {
        include: { studentProfile: true },
      },
    },
  });

  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Certificate not found");
  }

  await prisma.certificate.delete({ where: { id } });

  // Update studentProfile isCertified if no published certs remain
  const remainingPublished = await prisma.certificate.count({
    where: {
      userId: existing.userId,
      status: "PUBLISHED",
    },
  });

  if (remainingPublished === 0 && existing.user.studentProfile) {
    await prisma.studentProfile.update({
      where: { id: existing.user.studentProfile.id },
      data: {
        isCertified: false,
      },
    });
  }

  return { success: true, message: "Certificate deleted successfully" };
}

/**
 * Public Verification Service
 * Supports:
 *  1. Encrypted token (AES-256-CBC URL-safe string)
 *  2. Certificate ID (e.g. "PG4673109")
 *  3. Student ID (e.g. "2301-IBM-0001")
 */
export async function verifyCertificate(tokenOrIdentifier: string) {
  if (!tokenOrIdentifier || !tokenOrIdentifier.trim()) {
    return {
      verified: false,
      message: "No verification token or credential ID provided",
    };
  }

  const clean = tokenOrIdentifier.trim();
  let decrypted: any = null;

  // Attempt to decrypt if it looks like an encrypted token (contains '.')
  if (clean.includes(".")) {
    decrypted = decryptPayload(clean);
  }

  let certificate = null;

  // 1. Look up by decrypted compact student ID or certificate ID
  if (typeof decrypted === "string" && decrypted) {
    certificate = await prisma.certificate.findFirst({
      where: {
        OR: [
          { certificateId: { equals: decrypted, mode: "insensitive" } },
          { studentId: { equals: decrypted, mode: "insensitive" } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            studentProfile: true,
          },
        },
      },
    });
  } else if (decrypted && typeof decrypted === "object") {
    const certId = decrypted.certificateId || decrypted.studentId || decrypted.c || decrypted.s;
    if (certId) {
      certificate = await prisma.certificate.findFirst({
        where: {
          OR: [
            { certificateId: { equals: certId, mode: "insensitive" } },
            { studentId: { equals: certId, mode: "insensitive" } },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              studentProfile: true,
            },
          },
        },
      });
    }
  }

  // 2. Direct encryptedToken or identifier fallback lookup
  if (!certificate) {
    certificate = await prisma.certificate.findFirst({
      where: {
        OR: [
          { encryptedToken: clean },
          { certificateId: { equals: clean, mode: "insensitive" } },
          { studentId: { equals: clean, mode: "insensitive" } },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            studentProfile: true,
          },
        },
      },
    });
  }

  // 3. If certificate record not created yet, check if student is enrolled in the academy
  if (!certificate) {
    const lookupId = (typeof decrypted === "string" ? decrypted : null) || clean;
    const profile = await prisma.studentProfile.findFirst({
      where: { studentId: { equals: lookupId, mode: "insensitive" } },
      include: { user: true },
    });

    if (profile && profile.user) {
      return {
        verified: true,
        isPublished: false,
        status: "ENROLLED_NO_CERTIFICATE",
        message: "Student is enrolled on this course but not gained the certificate.",
        student: {
          studentName: profile.user.name,
          studentId: profile.studentId,
          courseTitle: profile.program || "Enrolled Programme",
          avatar: profile.user.avatar || null,
          institution: "ProGemini Academy",
        },
      };
    }

    return {
      verified: false,
      message: `No official institutional record or certificate found for this verification token.`,
    };
  }

  // 4. If certificate exists but is NOT published (DRAFT or uncertified)
  if (certificate.status !== "PUBLISHED") {
    return {
      verified: true,
      isPublished: false,
      status: certificate.status,
      message: "Student is enrolled on this course but not gained the certificate.",
      student: {
        studentName: certificate.studentName,
        studentId: certificate.studentId || certificate.user?.studentProfile?.studentId || certificate.certificateId,
        courseTitle: certificate.courseTitle,
        grade: certificate.grade,
        avatar: certificate.user?.avatar || null,
        institution: "ProGemini Academy",
      },
    };
  }

  // 5. If certificate IS published
  return {
    verified: true,
    isPublished: true,
    status: "PUBLISHED",
    message: "Official ProGemini Academy Certificate of Completion Authenticated",
    certificate: {
      id: certificate.id,
      certificateId: certificate.certificateId,
      studentId: certificate.studentId || certificate.user?.studentProfile?.studentId || certificate.certificateId,
      studentName: certificate.studentName,
      courseTitle: certificate.courseTitle,
      grade: certificate.grade,
      issueDate: certificate.issueDate,
      learningHours: certificate.learningHours || "As per programme",
      publishedAt: certificate.publishedAt || certificate.updatedAt,
      status: "Officially Verified & Cleared",
      institution: "ProGemini Academy",
      institutionUrl: "https://progemini.academy",
      accreditation: "Authenticated Institutional Award",
      verificationUrl: certificate.verificationUrl,
      avatar: certificate.user?.avatar || null,
    },
  };
}
