import { z } from "zod";

export const listCoursesQuerySchema = z.object({
  query: z.object({
    category: z.string().optional(),
    search: z.string().optional(),
    status: z.string().optional(),
  }),
});

export const createCourseSchema = z.object({
  body: z.record(z.unknown()),
});

export const updateCourseSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.record(z.unknown()),
});

export const togglePublishSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ isPublished: z.boolean() }),
});

export const courseIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const sectionIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid(), sectionId: z.string().uuid() }),
});

export const createSectionSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    order: z.number().optional(),
  }),
});

export const updateSectionSchema = z.object({
  params: z.object({ id: z.string().uuid(), sectionId: z.string().uuid() }),
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    order: z.number().optional(),
  }),
});

export const createLectureSchema = z.object({
  params: z.object({ id: z.string().uuid(), sectionId: z.string().uuid() }),
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    type: z.enum(["VIDEO", "DOCUMENT", "QUIZ"]).optional(),
    content: z.string().optional(),
    duration: z.number().optional(),
    order: z.number().optional(),
    isFree: z.boolean().optional(),
  }),
});

export const updateLectureSchema = z.object({
  params: z.object({ id: z.string().uuid(), sectionId: z.string().uuid(), lectureId: z.string().uuid() }),
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    type: z.enum(["VIDEO", "DOCUMENT", "QUIZ"]).optional(),
    content: z.string().optional(),
    duration: z.number().optional(),
    order: z.number().optional(),
    isFree: z.boolean().optional(),
  }),
});

export const lectureIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid(), sectionId: z.string().uuid(), lectureId: z.string().uuid() }),
});

export const createStudySectionSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
  }),
});

export const updateStudySectionSchema = z.object({
  params: z.object({ id: z.string().uuid(), sectionId: z.string().uuid() }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    order: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const studySectionIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid(), sectionId: z.string().uuid() }),
});

export const createReviewSchema = z.object({
  body: z.object({
    courseId: z.string().uuid(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
  }),
});

export const listReviewsQuerySchema = z.object({
  query: z.object({ courseId: z.string().uuid("courseId is required") }),
});

export const createEnrollmentSchema = z.object({
  body: z.object({
    courseId: z.string().uuid(),
    studySectionId: z.string().uuid("studySectionId is required"),
  }),
});

export const enrollmentIdParamSchema = z.object({
  params: z.object({ enrollmentId: z.string().uuid() }),
});

export const updateProgressSchema = z.object({
  params: z.object({ enrollmentId: z.string().uuid() }),
  body: z.object({
    lessonId: z.string().uuid(),
    isCompleted: z.boolean(),
    watchTime: z.number(),
  }),
});

export const featuredOrdersQuerySchema = z.object({
  query: z.object({ excludeId: z.string().uuid().optional() }),
});
