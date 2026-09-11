import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/ApiError";

// ─── Student Attendance ────────────────────────────────

export async function getStudentAttendance(
  userId: string,
  query: { courseId?: string; studySectionId?: string; startDate?: string; endDate?: string },
) {
  // Get student's enrolled courses
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: userId },
    select: { courseId: true, course: { select: { id: true, title: true } } },
  });
  const enrolledCourses = enrollments.map((e) => e.course);

  // Build attendance query
  const where: Record<string, unknown> = { studentId: userId };
  if (query.courseId) where.courseId = query.courseId;
  if (query.studySectionId) where.studySectionId = query.studySectionId;
  if (query.startDate || query.endDate) {
    const dateFilter: Record<string, Date> = {};
    if (query.startDate) dateFilter.gte = new Date(query.startDate);
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setDate(end.getDate() + 1);
      dateFilter.lt = end;
    }
    where.date = dateFilter;
  }

  const attendances = await prisma.attendance.findMany({
    where,
    include: { course: { select: { id: true, title: true } } },
    orderBy: { date: "desc" },
  });

  // Group by course
  const grouped = attendances.reduce<Record<string, { course: { id: string; title: string }; records: typeof attendances }>>((acc, att) => {
    const key = att.courseId;
    if (!acc[key]) acc[key] = { course: att.course, records: [] };
    acc[key].records.push(att);
    return acc;
  }, {});

  // Stats by course
  const statsByCourse: Record<string, { courseTitle: string; total: number; present: number; absent: number; late: number }> = {};
  for (const [courseId, group] of Object.entries(grouped)) {
    const records = group.records;
    statsByCourse[courseId] = {
      courseTitle: group.course.title,
      total: records.length,
      present: records.filter((r) => r.status === "PRESENT").length,
      absent: records.filter((r) => r.status === "ABSENT").length,
      late: records.filter((r) => r.status === "LATE").length,
    };
  }

  // Overall stats
  const totalClasses = attendances.length;
  const presentCount = attendances.filter((a) => a.status === "PRESENT").length;
  const absentCount = attendances.filter((a) => a.status === "ABSENT").length;
  const lateCount = attendances.filter((a) => a.status === "LATE").length;

  return {
    attendances: Object.values(grouped),
    enrolledCourses,
    statsByCourse,
    overallStats: {
      totalClasses,
      presentCount,
      absentCount,
      lateCount,
      attendanceRate: totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0,
    },
  };
}

// ─── Admin Attendance Reports ──────────────────────────

export async function getAdminAttendance(query: { courseId?: string; startDate?: string; endDate?: string }) {
  const where: Record<string, unknown> = {};
  if (query.courseId) where.courseId = query.courseId;

  // Default to current week
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const startDate = query.startDate ? new Date(query.startDate) : startOfWeek;
  const endDate = query.endDate ? new Date(query.endDate) : endOfWeek;

  where.date = { gte: startDate, lte: endDate };

  const [attendances, courses] = await Promise.all([
    prisma.attendance.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, email: true, avatar: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: [{ date: "desc" }, { student: { name: "asc" } }],
    }),
    prisma.course.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);

  // Group by course
  const grouped = attendances.reduce<Record<string, { course: { id: string; title: string }; records: typeof attendances }>>((acc, att) => {
    const key = att.courseId;
    if (!acc[key]) acc[key] = { course: att.course, records: [] };
    acc[key].records.push(att);
    return acc;
  }, {});

  const totalRecords = attendances.length;
  const presentCount = attendances.filter((a) => a.status === "PRESENT").length;
  const absentCount = attendances.filter((a) => a.status === "ABSENT").length;
  const lateCount = attendances.filter((a) => a.status === "LATE").length;

  return {
    attendances: Object.values(grouped),
    courses,
    stats: { totalRecords, presentCount, absentCount, lateCount },
    period: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
  };
}

// ─── Admin Course Attendance ───────────────────────────

export async function getCourseAttendance(
  courseId: string,
  query: { date?: string; startDate?: string; endDate?: string; studySectionId?: string },
) {
  const where: Record<string, unknown> = { courseId };
  if (query.studySectionId) where.studySectionId = query.studySectionId;

  if (query.date) {
    const d = new Date(query.date);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    where.date = { gte: d, lt: next };
  } else if (query.startDate || query.endDate) {
    const dateFilter: Record<string, Date> = {};
    if (query.startDate) dateFilter.gte = new Date(query.startDate);
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setDate(end.getDate() + 1);
      dateFilter.lt = end;
    }
    where.date = dateFilter;
  }

  return prisma.attendance.findMany({
    where,
    include: {
      student: { select: { id: true, name: true, email: true } },
      markedBy: { select: { id: true, name: true } },
    },
    orderBy: [{ date: "desc" }, { student: { name: "asc" } }],
  });
}

export async function markAttendance(
  courseId: string,
  data: { date: string; attendanceRecords: Array<{ studentId: string; status: string; notes?: string }>; studySectionId?: string },
  markedById: string,
) {
  const date = new Date(data.date);

  // Delete existing records for this course+date (optionally filtered by studySectionId)
  const deleteWhere: Record<string, unknown> = { courseId, date };
  if (data.studySectionId) deleteWhere.studySectionId = data.studySectionId;
  await prisma.attendance.deleteMany({ where: deleteWhere });

  // Create new records
  const records = data.attendanceRecords.map((r) => ({
    studentId: r.studentId,
    courseId,
    date,
    status: r.status as "PRESENT" | "ABSENT" | "LATE",
    notes: r.notes || null,
    markedById,
    studySectionId: data.studySectionId || null,
  }));

  await prisma.attendance.createMany({ data: records });

  return { message: "Attendance recorded successfully" };
}

export async function updateAttendanceRecord(
  attendanceId: string,
  data: { status: string; notes?: string },
) {
  const existing = await prisma.attendance.findUnique({ where: { id: attendanceId } });
  if (!existing) throw AppError.notFound("Attendance record not found");

  return prisma.attendance.update({
    where: { id: attendanceId },
    data: {
      status: data.status as "PRESENT" | "ABSENT" | "LATE",
      ...(data.notes !== undefined && { notes: data.notes }),
    },
    include: {
      student: { select: { id: true, name: true, email: true } },
    },
  });
}
