import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/ApiError";
import * as fileService from "@/services/file.service";
import { logger } from "@/utils/logger";

export async function getStudentProfile(userId: string) {
  let user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      studentProfile: true,
      enrollments: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              thumbnail: true,
            },
          },
        },
        orderBy: { enrolledAt: "desc" },
      },
      _count: {
        select: {
          enrollments: true,
          reviews: true,
        },
      },
    },
  });

  if (!user) {
    throw AppError.notFound("User not found");
  }

  // If studentProfile doesn't exist yet, automatically initialize it
  if (!user.studentProfile && user.role === "STUDENT") {
    // Check if user has an application to pre-populate details
    const latestApplication = await prisma.application.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    let prefillData: Record<string, any> = {
      userId,
    };

    if (latestApplication) {
      prefillData = {
        ...prefillData,
        address: latestApplication.address
          ? `${latestApplication.address}, ${latestApplication.city || ""}, ${latestApplication.country || ""}`.trim()
          : null,
        gender: latestApplication.gender || null,
        nationality: latestApplication.nationality || null,
        dateOfBirth: latestApplication.dateOfBirth ? new Date(latestApplication.dateOfBirth) : null,
      };
    }

    try {
      const studentProfile = await prisma.studentProfile.create({
        data: prefillData as any,
      });

      user = {
        ...user,
        studentProfile,
      };
    } catch (e) {
      logger.warn({ err: e }, "Failed to auto-create empty student profile");
    }
  }

  return user;
}

const parseSafeDate = (val: any): Date | null => {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

export async function updateStudentProfile(userId: string, data: Record<string, any>) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { studentProfile: true },
  });

  if (!user) {
    throw AppError.notFound("User not found");
  }

  // Check required fields
  const name = (data.name || "").trim();
  const phone = (data.phone || "").trim();
  const passport = (data.passport || "").trim();
  const nationality = (data.nationality || "").trim();
  const address = (data.address || data.presentAddress || "").trim();

  if (!name || !phone || !passport || !nationality || !address) {
    throw AppError.badRequest(
      "Name, Phone, Passport, Nationality, and Address are all required to complete your profile.",
    );
  }

  const isCompleted = Boolean(
    name && phone && passport && nationality && address && (data.avatar || user.avatar),
  );

  // Update User table base credentials
  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      phone,
      address,
      avatar: data.avatar !== undefined ? data.avatar : user.avatar,
      bio: data.bio !== undefined ? data.bio : user.bio,
    },
  });

  const profileData = {
    nextOfKinName: data.nextOfKinName?.trim() || null,
    nextOfKinRelationship: data.nextOfKinRelationship?.trim() || null,
    nextOfKinPhone: data.nextOfKinPhone?.trim() || null,
    nextOfKinEmail: data.nextOfKinEmail?.trim() || null,
    address,
    dateOfBirth: parseSafeDate(data.dateOfBirth),
    gender: data.gender?.trim() || null,
    nationality,
    passport,
    isCompleted,
  };

  await prisma.studentProfile.upsert({
    where: { userId },
    create: {
      userId,
      ...profileData,
    },
    update: profileData,
  });

  return getStudentProfile(userId);
}

export async function adminUpdateStudentProfile(targetUserId: string, data: Record<string, any>) {
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!user) {
    throw AppError.notFound("Student user not found");
  }

  // If user base fields are passed
  if (data.name || data.phone || data.avatar || data.address) {
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.phone ? { phone: data.phone.trim() } : {}),
        ...(data.avatar ? { avatar: data.avatar.trim() } : {}),
        ...(data.address ? { address: data.address.trim() } : {}),
      },
    });
  }

  const academicData: Record<string, any> = {};
  if (data.studentId !== undefined) academicData.studentId = data.studentId?.trim() || null;
  if (data.program !== undefined) academicData.program = data.program?.trim() || null;
  if (data.startedSemester !== undefined) academicData.startedSemester = data.startedSemester?.trim() || null;
  if (data.startedYear !== undefined) academicData.startedYear = data.startedYear?.trim() || null;

  // Next of Kin & Address
  if (data.nextOfKinName !== undefined) academicData.nextOfKinName = data.nextOfKinName?.trim() || null;
  if (data.nextOfKinRelationship !== undefined) academicData.nextOfKinRelationship = data.nextOfKinRelationship?.trim() || null;
  if (data.nextOfKinPhone !== undefined) academicData.nextOfKinPhone = data.nextOfKinPhone?.trim() || null;
  if (data.nextOfKinEmail !== undefined) academicData.nextOfKinEmail = data.nextOfKinEmail?.trim() || null;
  if (data.address !== undefined) academicData.address = data.address?.trim() || null;

  // Personal fields
  if (data.dateOfBirth !== undefined) academicData.dateOfBirth = parseSafeDate(data.dateOfBirth);
  if (data.gender !== undefined) academicData.gender = data.gender?.trim() || null;
  if (data.nationality !== undefined) academicData.nationality = data.nationality?.trim() || null;
  if (data.passport !== undefined) academicData.passport = data.passport?.trim() || null;
  if (data.isCompleted !== undefined) academicData.isCompleted = Boolean(data.isCompleted);

  await prisma.studentProfile.upsert({
    where: { userId: targetUserId },
    create: {
      userId: targetUserId,
      ...academicData,
    },
    update: academicData,
  });

  return getStudentProfile(targetUserId);
}

export async function uploadStudentAvatar(userId: string, file: Express.Multer.File) {
  if (!file) {
    throw AppError.badRequest("Please select an image file to upload");
  }

  // Allowed image MIME types
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw AppError.badRequest("Invalid file format. Please upload a JPEG, PNG, or WebP image.");
  }

  // Max 5MB
  if (file.size > 5 * 1024 * 1024) {
    throw AppError.badRequest("Image file size exceeds the 5MB limit.");
  }

  const uploaded = await fileService.uploadFile(userId, file, {
    fileType: "PROFILE_PICTURE",
    isTemporary: "false",
  });

  // Update user avatar in DB
  await prisma.user.update({
    where: { id: userId },
    data: { avatar: uploaded.fullUrl },
  });

  return {
    avatarUrl: uploaded.fullUrl,
    file: uploaded,
  };
}

export function getCourseShortCode(courseName: string): string {
  if (!courseName) return "GEN";
  const name = courseName.trim();

  // Known Progemini Academic Curriculum Mappings
  if (/MBA/i.test(name) || /Business\s+Administration/i.test(name)) return "MBA";
  if (/Cyber\s*Security/i.test(name)) return "CSY";
  if (/Fraud\s*Investigation/i.test(name)) return "FIF";
  if (/Accounting/i.test(name)) return "AFM";
  if (/Sustainability|Systems\s*Leadership/i.test(name)) return "AIS";
  if (/International\s*Business/i.test(name)) return "IBM";
  if (/Hospitality|Events/i.test(name)) return "BHM";
  if (/Human\s*Resource/i.test(name)) return "HRM";
  if (/Tourism/i.test(name)) return "BTM";
  if (/Global\s*Health|Well-?Being/i.test(name)) return "GHW";
  if (/Computer\s*Science/i.test(name)) return "CSE";
  if (/Software/i.test(name)) return "SWE";
  if (/Data\s*Science|Artificial\s*Intelligence/i.test(name)) return "DAT";
  if (/Criminology|Law/i.test(name)) return "LAW";

  // Check for acronym in parentheses like (MBA) or (CSE)
  const parenMatch = name.match(/\(([A-Za-z0-9]{2,5})\)/);
  if (parenMatch) return parenMatch[1].toUpperCase();

  // Dynamic derivation: strip degree prefixes and common words
  const clean = name.replace(/^(BSc|MSc|BA|MA|Diploma|Postgraduate|Certificate|Level\s*\d+)\s*(?:\(Hons\))?/i, "");
  const words = clean.match(/[A-Za-z]+/g)?.filter(w => !/^(of|in|and|the|for|with|at|a|an|to|level)$/i.test(w)) || [];
  if (words.length >= 3) {
    return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  } else if (words.length === 2) {
    return (words[0][0] + words[1].slice(0, 2)).toUpperCase();
  } else if (words.length === 1 && words[0].length >= 3) {
    return words[0].slice(0, 3).toUpperCase();
  }

  return "GEN";
}

export async function generateDynamicStudentId(params: {
  year?: string;
  semester?: string;
  courseName?: string;
  targetUserId?: string;
}) {
  const { year, semester, courseName, targetUserId } = params;

  // 1. Year (last 2 digits, e.g. 2026 -> 26)
  const rawYear = year ? String(year).trim() : String(new Date().getFullYear());
  const yearCode = rawYear.length >= 2 ? rawYear.slice(-2) : rawYear.padStart(2, "0");

  // 2. Semester (01: Spring, 02: Summer, 03: Fall)
  let semCode = "01";
  const semStr = (semester || "").toLowerCase().trim();
  if (semStr.includes("spring") || semStr === "1" || semStr === "01") {
    semCode = "01";
  } else if (semStr.includes("summer") || semStr === "2" || semStr === "02") {
    semCode = "02";
  } else if (semStr.includes("fall") || semStr.includes("autumn") || semStr === "3" || semStr === "03") {
    semCode = "03";
  }

  // 3. Course Short Code (3 letters)
  const courseCode = getCourseShortCode(courseName || "");

  // Dynamic Prefix: e.g. 2601-MBA-
  const prefix = `${yearCode}${semCode}-${courseCode}-`;

  // 4. Query matching profiles to determine sequence
  const matchingProfiles = await prisma.studentProfile.findMany({
    where: {
      studentId: {
        startsWith: prefix,
      },
      ...(targetUserId ? { NOT: { userId: targetUserId } } : {}),
    },
    select: {
      studentId: true,
    },
  });

  let maxSeq = 0;
  for (const p of matchingProfiles) {
    if (!p.studentId) continue;
    const match = p.studentId.match(new RegExp(`^${prefix}(\\d+)$`));
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  let nextSeq = maxSeq + 1;
  let candidateId = `${prefix}${String(nextSeq).padStart(4, "0")}`;

  // Collision safety check
  while (await prisma.studentProfile.findUnique({ where: { studentId: candidateId } })) {
    nextSeq++;
    candidateId = `${prefix}${String(nextSeq).padStart(4, "0")}`;
  }

  return {
    studentId: candidateId,
    prefix,
    courseCode,
    yearCode,
    semCode,
    sequence: String(nextSeq).padStart(4, "0"),
  };
}
