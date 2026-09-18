import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/ApiError";
import minioService from "@/utils/minio";
import { logger } from "@/utils/logger";
import {
  sendApplicationSubmissionEmail,
  sendApplicationApprovedEmail,
} from "@/utils/email";

// ─── Applications ──────────────────────────────────────

export async function createApplication(userId: string, data: Record<string, unknown>) {
  const courseId = data.courseId as string;

  const existing = await prisma.application.findFirst({
    where: { userId, courseId },
    select: { id: true, status: true },
  });
  if (existing) {
    throw AppError.badRequest("You have already applied for this course", { applicationId: existing.id });
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true },
  });
  if (!course) throw AppError.badRequest("Course not found");

  const documentFiles = (data.documentFiles as string[]) || [];

  const application = await prisma.application.create({
    data: {
      userId,
      courseId,
      firstName: data.firstName as string,
      lastName: data.lastName as string,
      email: data.email as string,
      phone: data.phone as string,
      dateOfBirth: data.dateOfBirth as string,
      gender: data.gender as string,
      nationality: data.nationality as string,
      address: data.address as string,
      city: data.city as string,
      state: data.state as string,
      zipCode: data.zipCode as string,
      country: data.country as string,
      highestEducation: data.highestEducation as string,
      institutionName: data.institutionName as string,
      fieldOfStudy: data.fieldOfStudy as string,
      graduationYear: data.graduationYear as string,
      gpa: (data.gpa as string) || null,
      englishProficiency: data.englishProficiency as string,
      previousCourses: (data.previousCourses as string) || null,
      workExperience: (data.workExperience as string) || null,
    },
    include: {
      course: { select: { id: true, title: true, thumbnail: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  // Link uploaded files to this application
  if (documentFiles.length > 0) {
    await prisma.file.updateMany({
      where: { id: { in: documentFiles }, uploadedById: userId },
      data: { applicationId: application.id, isTemporary: false },
    });
  }

  // Fetch linked files for email
  const files = await prisma.file.findMany({
    where: { applicationId: application.id },
    select: { id: true, fileName: true, originalName: true, fullUrl: true, fileSize: true },
  });

  // Send notification email (fire-and-forget)
  sendApplicationSubmissionEmail({ ...application, files }).catch((err) =>
    logger.error({ err }, "Failed to send application submission email"),
  );

  // Synchronize application demographics into student profile if not already set
  try {
    const existingProfile = await prisma.studentProfile.findUnique({ where: { userId } });
    const fullAddress = `${data.address || ""}, ${data.city || ""}, ${data.country || ""}`.replace(/^,\s*|,\s*$/g, "").trim();
    const dob = data.dateOfBirth ? new Date(data.dateOfBirth as string) : null;

    if (!existingProfile) {
      await prisma.studentProfile.create({
        data: {
          userId,
          address: fullAddress || null,
          gender: (data.gender as string) || null,
          nationality: (data.nationality as string) || null,
          dateOfBirth: dob,
          isCompleted: false,
        },
      });
    } else if (!existingProfile.isCompleted) {
      await prisma.studentProfile.update({
        where: { userId },
        data: {
          address: existingProfile.address || fullAddress || null,
          gender: existingProfile.gender || (data.gender as string) || null,
          nationality: existingProfile.nationality || (data.nationality as string) || null,
          dateOfBirth: existingProfile.dateOfBirth || dob,
        },
      });
    }
  } catch (syncErr) {
    logger.warn({ err: syncErr }, "Could not sync application data into studentProfile");
  }

  return application;
}

export async function listApplications(userId: string, role: string, status?: string) {
  const where: Record<string, unknown> = {};
  if (role !== "ADMIN") {
    where.userId = userId;
  }
  if (status) {
    where.status = status;
  }

  return prisma.application.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      course: { select: { id: true, title: true, thumbnail: true, price: true, discountPrice: true } },
      files: true,
      ...(role === "ADMIN" ? { user: { select: { id: true, name: true, email: true, avatar: true } } } : {}),
    },
  });
}

export async function getApplicationById(userId: string, role: string, id: string) {
  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      course: { select: { id: true, title: true, thumbnail: true, price: true, discountPrice: true } },
      user: { select: { id: true, name: true, email: true, avatar: true } },
      files: true,
    },
  });

  if (!application) throw AppError.notFound("Application not found");

  if (role !== "ADMIN" && application.userId !== userId) {
    throw AppError.forbidden("You do not have permission to view this application");
  }

  return application;
}

export async function updateApplicationStatus(id: string, data: Record<string, unknown>, adminId: string) {
  const existing = await prisma.application.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true } }, course: { select: { id: true, title: true } } },
  });
  if (!existing) throw AppError.notFound("Application not found");

  const newStatus = data.status as string;
  const updated = await prisma.application.update({
    where: { id },
    data: {
      status: newStatus as "IN_REVIEW" | "APPROVED" | "REJECTED",
      adminFeedback: (data.adminFeedback as string) || existing.adminFeedback,
      reviewedBy: adminId,
      reviewedAt: new Date(),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, title: true } },
    },
  });

  // Send approval email if status changed to APPROVED
  if (newStatus === "APPROVED" && existing.status !== "APPROVED" && existing.user) {
    sendApplicationApprovedEmail(
      existing.user.email,
      existing.user.name,
      existing.course?.title || "Course",
      data.adminFeedback as string | null,
    ).catch((err) => logger.error({ err }, "Failed to send application approval email"));
  }

  return updated;
}

export async function updateApplicationContent(userId: string, id: string, data: Record<string, unknown>) {
  const existing = await prisma.application.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound("Application not found");
  if (existing.userId !== userId) {
    throw AppError.forbidden("You do not have permission to edit this application");
  }
  if (existing.status !== "IN_REVIEW") {
    throw AppError.badRequest("Only applications in review can be edited");
  }

  const documentFiles = (data.documentFiles as string[]) || [];

  // Reconcile files: find currently linked files
  const currentFiles = await prisma.file.findMany({
    where: { applicationId: id },
    select: { id: true, slug: true },
  });
  const newFileIds = new Set(documentFiles);

  // Remove files no longer in the array
  const filesToRemove = currentFiles.filter((f: { id: string }) => !newFileIds.has(f.id));
  for (const file of filesToRemove) {
    try {
      await minioService.deleteFile(file.slug);
    } catch (err) {
      logger.error({ err, slug: file.slug }, "Failed to delete file from MinIO");
    }
  }
  await prisma.file.deleteMany({ where: { id: { in: filesToRemove.map((f: { id: string }) => f.id) } } });

  // Link new files
  if (documentFiles.length > 0) {
    await prisma.file.updateMany({
      where: { id: { in: documentFiles }, uploadedById: userId },
      data: { applicationId: id, isTemporary: false },
    });
  }

  const updated = await prisma.application.update({
    where: { id },
    data: {
      firstName: data.firstName as string,
      lastName: data.lastName as string,
      email: data.email as string,
      phone: data.phone as string,
      dateOfBirth: data.dateOfBirth as string,
      gender: data.gender as string,
      nationality: data.nationality as string,
      address: data.address as string,
      city: data.city as string,
      state: data.state as string,
      zipCode: data.zipCode as string,
      country: data.country as string,
      highestEducation: data.highestEducation as string,
      institutionName: data.institutionName as string,
      fieldOfStudy: data.fieldOfStudy as string,
      graduationYear: data.graduationYear as string,
      gpa: (data.gpa as string) || null,
      englishProficiency: data.englishProficiency as string,
      previousCourses: (data.previousCourses as string) || null,
      workExperience: (data.workExperience as string) || null,
    },
    include: {
      course: { select: { id: true, title: true, thumbnail: true } },
      user: { select: { id: true, name: true, email: true } },
      files: true,
    },
  });

  return updated;
}

export async function deleteApplication(userId: string, role: string, id: string) {
  const existing = await prisma.application.findUnique({
    where: { id },
    include: { files: { select: { id: true, slug: true } } },
  });
  if (!existing) throw AppError.notFound("Application not found");

  if (role !== "ADMIN") {
    if (existing.userId !== userId) {
      throw AppError.forbidden("You do not have permission to delete this application");
    }
    if (existing.status !== "IN_REVIEW") {
      throw AppError.badRequest("Only applications in review can be deleted");
    }
  }

  // Delete files from MinIO
  for (const file of existing.files) {
    try {
      await minioService.deleteFile(file.slug);
    } catch (err) {
      logger.error({ err, slug: file.slug }, "Failed to delete file from MinIO during application deletion");
    }
  }

  // Delete file records
  await prisma.file.deleteMany({ where: { applicationId: id } });

  // Delete application
  await prisma.application.delete({ where: { id } });

  return { message: "Application deleted" };
}

export async function checkApplication(userId: string, courseId: string) {
  const application = await prisma.application.findFirst({
    where: { userId, courseId },
    select: { id: true, status: true, createdAt: true },
  });

  return {
    exists: !!application,
    application: application || null,
  };
}

// ─── Enquiries ─────────────────────────────────────────

export async function createEnquiry(data: Record<string, unknown>) {
  const allowedSubmitterTypes = ["Institution", "Student", "Teacher", "Affiliate Marketer", "Other"];

  const submitterType = data.submitterType as string;
  if (!allowedSubmitterTypes.includes(submitterType)) {
    throw AppError.badRequest("Invalid submitter type");
  }

  if (data.enquiryType === "About a Course" && !data.courseName) {
    throw AppError.badRequest("Course name is required for course-related enquiries");
  }

  const enquiry = await prisma.enquiry.create({
    data: {
      fullName: data.fullName as string,
      email: data.email as string,
      phone: (data.phone as string) || null,
      country: (data.country as string) || "Not Specified",
      submitterType,
      enquiryType: data.enquiryType as string,
      courseName: (data.courseName as string) || null,
      message: data.message as string,
      status: "Pending",
    },
  });

  return {
    message: "Enquiry submitted successfully",
    enquiry: {
      ...enquiry,
      id: String(enquiry.id),
    },
  };
}

export async function listEnquiries(status?: string, page = 1, limit = 20) {
  const where: Record<string, unknown> = {};
  if (status && status !== "all") {
    where.status = status;
  }

  const [enquiries, total] = await Promise.all([
    prisma.enquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.enquiry.count({ where }),
  ]);

  return {
    enquiries: enquiries.map((e: { id: bigint; [key: string]: unknown }) => ({ ...e, id: String(e.id) })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getEnquiryById(id: string) {
  const enquiry = await prisma.enquiry.findUnique({ where: { id: BigInt(id) } });
  if (!enquiry) throw AppError.notFound("Enquiry not found");
  return { ...enquiry, id: String(enquiry.id) };
}

export async function updateEnquiryStatus(id: string, status: string) {
  const enquiry = await prisma.enquiry.findUnique({ where: { id: BigInt(id) } });
  if (!enquiry) throw AppError.notFound("Enquiry not found");

  const updated = await prisma.enquiry.update({
    where: { id: BigInt(id) },
    data: { status },
  });

  return { ...updated, id: String(updated.id) };
}

export async function deleteEnquiry(id: string) {
  await prisma.enquiry.findUnique({ where: { id: BigInt(id) } }).then((e: { id: bigint } | null) => {
    if (!e) throw AppError.notFound("Enquiry not found");
  });
  await prisma.enquiry.delete({ where: { id: BigInt(id) } });
  return { message: "Enquiry deleted successfully" };
}

// ─── Contact Form (stub) ──────────────────────────────

export async function handleContactForm(data: Record<string, unknown>) {
  logger.info({ name: data.name, email: data.email, subject: data.subject }, "Contact form submission (stub — not persisted)");
  return { success: true, message: "Message sent successfully! We'll get back to you soon." };
}
