import { prisma } from "@/config/prisma";
import { ApiError } from "@/utils/ApiError";
import { StatusCodes } from "http-status-codes";

export interface UpsertMarksheetInput {
  id?: string;
  userId: string;
  studentId?: string | null;
  courseTitle: string;
  mainFieldOfStudy?: string | null;
  level?: string | null;
  language?: string | null;
  modeOfStudy?: string | null;
  programmeLength?: string | null;
  creditRequirement?: string | null;
  overallAverage?: string | null;
  classification?: string | null;
  totalUkCredits?: number | null;
  totalEctsCredits?: number | null;
  semester?: string | null;
  academicYear?: string | null;
  issueDate?: string | Date | null;
  gpa?: string | null;
  totalCredits?: number | null;
  status?: string;
  modules: any[];
  remarks?: string | null;
}

export async function getUserMarksheets(userId: string) {
  const marksheets = await prisma.marksheet.findMany({
    where: { userId },
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
            },
          },
          certificates: {
            select: {
              id: true,
              issueDate: true,
              status: true,
            },
            take: 1,
            orderBy: { createdAt: "desc" },
          },
          applications: {
            where: { status: "APPROVED" },
            select: {
              course: {
                select: {
                  title: true,
                  category: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
            take: 1,
          },
        },
      },
    },
  });

  return marksheets;
}

export async function getMarksheetById(id: string) {
  return await prisma.marksheet.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          studentProfile: true,
          certificates: true,
          applications: {
            where: { status: "APPROVED" },
            include: { course: { include: { category: true } } },
          },
        },
      },
    },
  });
}

export async function upsertMarksheet(input: UpsertMarksheetInput) {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    include: {
      studentProfile: true,
      certificates: { take: 1, orderBy: { createdAt: "desc" } },
      applications: {
        where: { status: "APPROVED" },
        include: { course: { include: { category: true } } },
        take: 1,
      },
    },
  });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  const studentId = input.studentId || user.studentProfile?.studentId || null;
  const issueDate = input.issueDate
    ? new Date(input.issueDate)
    : user.certificates?.[0]?.issueDate || new Date();

  const mainFieldOfStudy =
    input.mainFieldOfStudy?.trim() ||
    user.applications?.[0]?.course?.category?.name ||
    "Business Studies";

  if (input.id) {
    return await prisma.marksheet.update({
      where: { id: input.id },
      data: {
        studentId,
        courseTitle: input.courseTitle.trim(),
        mainFieldOfStudy,
        level: input.level?.trim() || "Level 6 - Bachelor's Degree",
        language: input.language?.trim() || "English",
        modeOfStudy: input.modeOfStudy?.trim() || "Online / Campus",
        programmeLength: input.programmeLength?.trim() || "3 Years",
        creditRequirement: input.creditRequirement?.trim() || "120 UK Credits / 60 ECTS Credits",
        overallAverage: input.overallAverage?.trim() || null,
        classification: input.classification?.trim() || null,
        totalUkCredits: input.totalUkCredits !== undefined && input.totalUkCredits !== null ? Number(input.totalUkCredits) : 120,
        totalEctsCredits: input.totalEctsCredits !== undefined && input.totalEctsCredits !== null ? Number(input.totalEctsCredits) : 60,
        semester: input.semester?.trim() || null,
        academicYear: input.academicYear?.trim() || null,
        issueDate,
        gpa: input.gpa?.trim() || null,
        totalCredits: input.totalCredits ?? null,
        status: input.status || "PUBLISHED",
        modules: input.modules || [],
        remarks: input.remarks?.trim() || null,
      },
    });
  }

  return await prisma.marksheet.create({
    data: {
      userId: user.id,
      studentId,
      courseTitle: input.courseTitle.trim(),
      mainFieldOfStudy,
      level: input.level?.trim() || "Level 6 - Bachelor's Degree",
      language: input.language?.trim() || "English",
      modeOfStudy: input.modeOfStudy?.trim() || "Online / Campus",
      programmeLength: input.programmeLength?.trim() || "3 Years",
      creditRequirement: input.creditRequirement?.trim() || "120 UK Credits / 60 ECTS Credits",
      overallAverage: input.overallAverage?.trim() || null,
      classification: input.classification?.trim() || null,
      totalUkCredits: input.totalUkCredits !== undefined && input.totalUkCredits !== null ? Number(input.totalUkCredits) : 120,
      totalEctsCredits: input.totalEctsCredits !== undefined && input.totalEctsCredits !== null ? Number(input.totalEctsCredits) : 60,
      semester: input.semester?.trim() || null,
      academicYear: input.academicYear?.trim() || null,
      issueDate,
      gpa: input.gpa?.trim() || null,
      totalCredits: input.totalCredits ?? null,
      status: input.status || "PUBLISHED",
      modules: input.modules || [],
      remarks: input.remarks?.trim() || null,
    },
  });
}

export async function deleteMarksheet(id: string) {
  const existing = await prisma.marksheet.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Marksheet not found");
  }
  await prisma.marksheet.delete({ where: { id } });
  return { success: true, message: "Marksheet deleted successfully" };
}
