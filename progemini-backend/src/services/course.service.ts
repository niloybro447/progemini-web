import { prisma } from "@/config/prisma";
import { AppError } from "@/utils/ApiError";

// ─── Helpers ───────────────────────────────────────────

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeRichField(value: unknown): string | null {
  if (value === null || value === undefined) return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && parsed.type === "doc") {
        return JSON.stringify({ json: parsed, html: "" });
      }
      if (typeof parsed === "object") {
        return JSON.stringify(parsed);
      }
    } catch {
      // not JSON
    }
    if (trimmed.startsWith("<")) {
      return JSON.stringify({ json: null, html: trimmed });
    }
    return JSON.stringify({ json: null, html: `<p>${trimmed}</p>` });
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (obj.type === "doc") {
      return JSON.stringify({ json: obj, html: "" });
    }
    return JSON.stringify(obj);
  }

  return String(value);
}

async function updateCourseTotals(courseId: string): Promise<void> {
  const sections = await prisma.courseSection.findMany({
    where: { courseId },
    include: { lessons: true },
  });
  const totalLectures = sections.reduce((sum, s) => sum + (s.lessons?.length || 0), 0);
  const totalDuration = sections.reduce(
    (sum, s) => sum + (s.lessons?.reduce((ls, l) => ls + (l.duration || 0), 0) || 0),
    0,
  );
  await prisma.course.update({ where: { id: courseId }, data: { totalLectures, totalDuration } });
}

// ─── Public Courses ────────────────────────────────────

export async function listCourses(query: { category?: string; search?: string; status?: string }) {
  const where: Record<string, unknown> = {};

  if (query.category) {
    const cat = await prisma.category.findUnique({ where: { slug: query.category } });
    if (cat) where.categoryId = cat.id;
  }
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { shortDescription: { contains: query.search, mode: "insensitive" } },
    ];
  }
  if (query.status) {
    where.status = query.status.toUpperCase();
  } else {
    where.isPublished = true;
  }

  return prisma.course.findMany({
    where,
    include: {
      category: true,
      _count: { select: { enrollments: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createCourse(data: Record<string, unknown>) {
  return prisma.course.create({
    data: { ...data, status: "DRAFT", isPublished: false } as never,
  });
}

export async function getCourseById(id: string) {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      category: true,
      sections: {
        include: { lessons: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
    },
  });
  if (!course) throw AppError.notFound("Course not found");
  return course;
}

export async function getCourseBySlug(slug: string) {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      category: true,
      sections: {
        include: { lessons: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
    },
  });
  if (!course) throw AppError.notFound("Course not found");
  return course;
}

export async function updateCourse(id: string, data: Record<string, unknown>) {
  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound("Course not found");
  return prisma.course.update({ where: { id }, data: data as never });
}

export async function deleteCourse(id: string) {
  await prisma.course.delete({ where: { id } });
  return { message: "Course deleted successfully" };
}

// ─── Admin Courses ─────────────────────────────────────

export async function listAdminCourses() {
  return prisma.course.findMany({
    include: {
      category: { select: { id: true, name: true } },
      _count: { select: { enrollments: true, reviews: true, sections: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createAdminCourse(data: Record<string, unknown>) {
  const title = data.title as string;
  const categoryId = data.categoryId as string;

  if (!title || !categoryId) {
    throw AppError.badRequest("title and categoryId are required");
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw AppError.badRequest("Category not found");

  const slug = (data.slug as string) || generateSlug(title);
  const existingSlug = await prisma.course.findUnique({ where: { slug } });
  if (existingSlug) throw AppError.badRequest("A course with this slug already exists");

  const course = await prisma.course.create({
    data: {
      title,
      slug,
      shortDescription: (data.shortDescription as string) || "",
      description: (data.description as string) || "",
      categoryId,
      featureImage: (data.featureImage as string) || "",
      totalLearningHour: (data.totalLearningHour as string) || "",
      award: (data.award as string) || "",
      awardedBy: (data.awardedBy as string) || "",
      credits: (data.credits as number) || 0,
      deliveryMode: (data.deliveryMode as string) || null,
      introduction: normalizeRichField(data.introduction) || "",
      assessmentsVerification: normalizeRichField(data.assessmentsVerification) || "",
      academicAchievement: normalizeRichField(data.academicAchievement) || "",
      careerOpportunities: normalizeRichField(data.careerOpportunities) || "",
      whatYouLearn: JSON.stringify((data.whatYouLearn as string[]) || []),
      requirements: JSON.stringify((data.requirements as string[]) || []),
      customSections: data.customSections ? JSON.stringify(data.customSections) : null,
      tags: (data.tags as string[]) || [],
      metaTitle: (data.metaTitle as string) || "",
      metaDescription: (data.metaDescription as string) || "",
      metaKeywords: (data.metaKeywords as string[]) || [],
      status: "DRAFT",
      isPublished: false,
      isFeatured: (data.isFeatured as boolean) || false,
      featuredOrder: data.isFeatured && data.featuredOrder ? (data.featuredOrder as number) : null,
      price: (data.price as number) || 0,
      discountPrice: (data.discountPrice as number) || null,
      level: (data.level as string) || "Beginner",
      duration: (data.duration as string) || null,
      language: (data.language as string) || "English",
    },
    include: { category: { select: { name: true } } },
  });

  return course;
}

export async function getAdminCourseById(id: string) {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      sections: {
        include: { lessons: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
    },
  });
  if (!course) throw AppError.notFound("Course not found");
  return course;
}

export async function updateAdminCourse(id: string, data: Record<string, unknown>) {
  const existing = await prisma.course.findUnique({ where: { id } });
  if (!existing) throw AppError.notFound("Course not found");

  if (data.slug && data.slug !== existing.slug) {
    const slugExists = await prisma.course.findUnique({ where: { slug: data.slug as string } });
    if (slugExists) throw AppError.badRequest("A course with this slug already exists");
  }

  if (data.categoryId) {
    const cat = await prisma.category.findUnique({ where: { id: data.categoryId as string } });
    if (!cat) throw AppError.badRequest("Category not found");
  }

  const richFields = ["introduction", "assessmentsVerification", "academicAchievement", "careerOpportunities"];
  const jsonFields = ["whatYouLearn", "requirements", "customSections"];
  const updateData: Record<string, unknown> = { ...data };
  for (const field of richFields) {
    if (field in updateData) {
      updateData[field] = normalizeRichField(updateData[field]);
    }
  }
  for (const field of jsonFields) {
    if (field in updateData && Array.isArray(updateData[field])) {
      updateData[field] = JSON.stringify(updateData[field]);
    }
  }

  if (updateData.slug) updateData.slug = (updateData.slug as string).toLowerCase().trim();

  return prisma.course.update({
    where: { id },
    data: updateData as never,
    include: { category: { select: { name: true } } },
  });
}

export async function deleteAdminCourse(id: string) {
  const course = await prisma.course.findUnique({ where: { id }, select: { slug: true } });
  if (!course) throw AppError.notFound("Course not found");
  await prisma.course.delete({ where: { id } });
  return { message: "Course deleted successfully" };
}

export async function togglePublish(id: string, isPublished: boolean) {
  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) throw AppError.notFound("Course not found");

  await prisma.course.update({ where: { id }, data: { isPublished: !isPublished } });
  return {
    message: `Course ${!isPublished ? "published" : "unpublished"} successfully`,
    isPublished: !isPublished,
  };
}

export async function getFeaturedOrders(excludeId?: string) {
  return prisma.course.findMany({
    where: {
      isFeatured: true,
      featuredOrder: { not: null },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true, title: true, featuredOrder: true },
  });
}

// ─── Sections ──────────────────────────────────────────

export async function listSections(courseId: string) {
  return prisma.courseSection.findMany({
    where: { courseId },
    include: { lessons: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  });
}

export async function createSection(courseId: string, data: { title: string; description?: string; order?: number }) {
  const lastSection = await prisma.courseSection.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
  });
  const order = data.order ?? ((lastSection?.order ?? 0) + 1);

  const section = await prisma.courseSection.create({
    data: { title: data.title, description: data.description, order, courseId },
    include: { lessons: true },
  });

  await updateCourseTotals(courseId);
  return section;
}

export async function updateSection(
  courseId: string,
  sectionId: string,
  data: { title?: string; description?: string; order?: number },
) {
  const section = await prisma.courseSection.update({
    where: { id: sectionId },
    data,
    include: { lessons: { orderBy: { order: "asc" } } },
  });

  await updateCourseTotals(courseId);
  return section;
}

export async function deleteSection(courseId: string, sectionId: string) {
  await prisma.courseSection.delete({ where: { id: sectionId } });
  await updateCourseTotals(courseId);
  return { message: "Section deleted successfully" };
}

// ─── Lectures ──────────────────────────────────────────

export async function createLecture(
  courseId: string,
  sectionId: string,
  data: { title: string; description?: string; type?: string; content?: string; duration?: number; order?: number; isFree?: boolean },
) {
  const lastLesson = await prisma.lesson.findFirst({
    where: { sectionId },
    orderBy: { order: "desc" },
  });
  const order = data.order ?? ((lastLesson?.order ?? 0) + 1);
  const durationInSeconds = (data.duration || 0) * 60;

  const lesson = await prisma.lesson.create({
    data: {
      title: data.title,
      description: data.description,
      type: (data.type as "VIDEO" | "DOCUMENT" | "QUIZ") || "VIDEO",
      content: data.content,
      duration: durationInSeconds,
      order,
      isFree: data.isFree ?? false,
      sectionId,
    },
  });

  await updateCourseTotals(courseId);
  return lesson;
}

export async function updateLecture(
  courseId: string,
  _sectionId: string,
  lectureId: string,
  data: { title?: string; description?: string; type?: string; content?: string; duration?: number; order?: number; isFree?: boolean },
) {
  const updateData: Record<string, unknown> = { ...data };
  if (data.duration !== undefined) updateData.duration = data.duration * 60;
  if (data.type) updateData.type = data.type;

  const lesson = await prisma.lesson.update({ where: { id: lectureId }, data: updateData as never });
  await updateCourseTotals(courseId);
  return lesson;
}

export async function deleteLecture(courseId: string, _sectionId: string, lectureId: string) {
  await prisma.lesson.delete({ where: { id: lectureId } });
  await updateCourseTotals(courseId);
  return { message: "Lecture deleted successfully" };
}

// ─── Study Sections ────────────────────────────────────

export async function listStudySections(courseId: string) {
  return prisma.studySection.findMany({
    where: { courseId },
    include: { _count: { select: { attendances: true, enrollments: true } } },
    orderBy: { order: "asc" },
  });
}

export async function createStudySection(courseId: string, data: { name: string; description?: string }) {
  const lastSection = await prisma.studySection.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
  });
  const order = (lastSection?.order ?? -1) + 1;

  return prisma.studySection.create({
    data: { name: data.name.trim(), description: data.description?.trim(), order, courseId },
    include: { _count: { select: { attendances: true, enrollments: true } } },
  });
}

export async function getStudySectionById(courseId: string, sectionId: string) {
  const section = await prisma.studySection.findUnique({
    where: { id: sectionId },
    include: {
      course: { select: { id: true, title: true } },
      _count: { select: { attendances: true, enrollments: true } },
    },
  });
  if (!section || section.courseId !== courseId) throw AppError.notFound("Study section not found");
  return section;
}

export async function updateStudySection(
  courseId: string,
  sectionId: string,
  data: { name?: string; description?: string; order?: number; isActive?: boolean },
) {
  const existing = await prisma.studySection.findUnique({ where: { id: sectionId } });
  if (!existing || existing.courseId !== courseId) throw AppError.notFound("Study section not found");

  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.description !== undefined) updateData.description = data.description?.trim() || null;
  if (data.order !== undefined) updateData.order = data.order;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  return prisma.studySection.update({
    where: { id: sectionId },
    data: updateData as never,
    include: { _count: { select: { attendances: true, enrollments: true } } },
  });
}

export async function deleteStudySection(courseId: string, sectionId: string) {
  const existing = await prisma.studySection.findUnique({ where: { id: sectionId } });
  if (!existing || existing.courseId !== courseId) throw AppError.notFound("Study section not found");
  await prisma.studySection.delete({ where: { id: sectionId } });
  return { message: "Study section deleted successfully" };
}

// ─── Categories ────────────────────────────────────────

export async function listCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

// ─── Reviews ───────────────────────────────────────────

export async function listReviews(courseId: string) {
  return prisma.review.findMany({
    where: { courseId, isApproved: true },
    include: { student: { select: { name: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createReview(studentId: string, data: { courseId: string; rating: number; comment?: string }) {
  const enrollment = await prisma.enrollment.findFirst({
    where: { studentId, courseId: data.courseId },
  });
  if (!enrollment) throw AppError.badRequest("You must be enrolled in this course to leave a review");

  const existing = await prisma.review.findUnique({
    where: { studentId_courseId: { studentId, courseId: data.courseId } },
  });
  if (existing) throw AppError.badRequest("You have already reviewed this course");

  return prisma.review.create({
    data: { studentId, courseId: data.courseId, rating: data.rating, comment: data.comment },
  });
}

// ─── Enrollments ───────────────────────────────────────

export async function listEnrollments(studentId: string) {
  return prisma.enrollment.findMany({
    where: { studentId },
    include: {
      course: { include: { category: true } },
      studySection: { select: { id: true, name: true } },
    },
    orderBy: { enrolledAt: "desc" },
  });
}

export async function createEnrollment(studentId: string, data: { courseId: string; studySectionId: string }) {
  const section = await prisma.studySection.findFirst({
    where: { id: data.studySectionId, courseId: data.courseId },
  });
  if (!section) throw AppError.notFound("Study section not found");

  const existing = await prisma.enrollment.findFirst({
    where: { studentId, courseId: data.courseId, studySectionId: data.studySectionId },
  });
  if (existing) throw AppError.badRequest("You are already enrolled in this section");

  return prisma.enrollment.create({
    data: { studentId, courseId: data.courseId, studySectionId: data.studySectionId, totalLessons: 0 },
  });
}

export async function getEnrollmentById(studentId: string, enrollmentId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: {
        include: {
          sections: {
            include: { lessons: { orderBy: { order: "asc" } } },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });
  if (!enrollment || enrollment.studentId !== studentId) throw AppError.notFound("Enrollment not found");
  return enrollment;
}

export async function updateProgress(
  studentId: string,
  enrollmentId: string,
  data: { lessonId: string; isCompleted: boolean; watchTime: number },
) {
  const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment || enrollment.studentId !== studentId) throw AppError.notFound("Enrollment not found");

  await prisma.lessonProgress.upsert({
    where: { enrollmentId_lessonId: { enrollmentId, lessonId: data.lessonId } },
    update: {
      isCompleted: data.isCompleted,
      watchTime: data.watchTime,
      completedAt: data.isCompleted ? new Date() : null,
    },
    create: {
      enrollmentId,
      lessonId: data.lessonId,
      isCompleted: data.isCompleted,
      watchTime: data.watchTime,
      completedAt: data.isCompleted ? new Date() : null,
    },
  });

  const allProgress = await prisma.lessonProgress.findMany({ where: { enrollmentId } });
  const completedCount = allProgress.filter((p) => p.isCompleted).length;
  const progress = enrollment.totalLessons > 0
    ? Math.round((completedCount / enrollment.totalLessons) * 100)
    : 0;

  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      progress,
      completedLessons: completedCount,
      lastAccessedAt: new Date(),
      isCompleted: progress === 100,
      completedAt: progress === 100 ? new Date() : null,
    },
  });

  return prisma.lessonProgress.findFirst({
    where: { enrollmentId, lessonId: data.lessonId },
  });
}
