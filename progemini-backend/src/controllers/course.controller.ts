import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import * as courseService from "@/services/course.service";
import { StatusCodes } from "http-status-codes";

// ─── Public Courses ────────────────────────────────────

export const listCourses = asyncHandler(async (req: Request, res: Response) => {
  const courses = await courseService.listCourses(req.query as { category?: string; search?: string; status?: string });
  res.status(StatusCodes.OK).json(courses);
});

export const createCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.createCourse(req.body);
  res.status(StatusCodes.CREATED).json(course);
});

export const getCourseById = asyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.getCourseById(req.params.id);
  res.status(StatusCodes.OK).json(course);
});

export const getCourseBySlug = asyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.getCourseBySlug(req.params.slug);
  res.status(StatusCodes.OK).json(course);
});

export const updateCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.updateCourse(req.params.id, req.body);
  res.status(StatusCodes.OK).json(course);
});

export const deleteCourse = asyncHandler(async (req: Request, res: Response) => {
  const result = await courseService.deleteCourse(req.params.id);
  res.status(StatusCodes.OK).json(result);
});

// ─── Admin Courses ─────────────────────────────────────

export const listAdminCourses = asyncHandler(async (_req: Request, res: Response) => {
  const courses = await courseService.listAdminCourses();
  res.status(StatusCodes.OK).json(courses);
});

export const createAdminCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.createAdminCourse(req.body);
  res.status(StatusCodes.CREATED).json(course);
});

export const getAdminCourseById = asyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.getAdminCourseById(req.params.id);
  res.status(StatusCodes.OK).json(course);
});

export const updateAdminCourse = asyncHandler(async (req: Request, res: Response) => {
  const course = await courseService.updateAdminCourse(req.params.id, req.body);
  res.status(StatusCodes.OK).json(course);
});

export const deleteAdminCourse = asyncHandler(async (req: Request, res: Response) => {
  const result = await courseService.deleteAdminCourse(req.params.id);
  res.status(StatusCodes.OK).json(result);
});

export const togglePublish = asyncHandler(async (req: Request, res: Response) => {
  const result = await courseService.togglePublish(req.params.id, req.body.isPublished);
  res.status(StatusCodes.OK).json(result);
});

export const getFeaturedOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await courseService.getFeaturedOrders(req.query.excludeId as string | undefined);
  res.status(StatusCodes.OK).json(orders);
});

// ─── Sections ──────────────────────────────────────────

export const listSections = asyncHandler(async (req: Request, res: Response) => {
  const sections = await courseService.listSections(req.params.id);
  res.status(StatusCodes.OK).json(sections);
});

export const createSection = asyncHandler(async (req: Request, res: Response) => {
  const section = await courseService.createSection(req.params.id, req.body);
  res.status(StatusCodes.CREATED).json(section);
});

export const updateSection = asyncHandler(async (req: Request, res: Response) => {
  const section = await courseService.updateSection(req.params.id, req.params.sectionId, req.body);
  res.status(StatusCodes.OK).json(section);
});

export const deleteSection = asyncHandler(async (req: Request, res: Response) => {
  const result = await courseService.deleteSection(req.params.id, req.params.sectionId);
  res.status(StatusCodes.OK).json(result);
});

// ─── Lectures ──────────────────────────────────────────

export const createLecture = asyncHandler(async (req: Request, res: Response) => {
  const lecture = await courseService.createLecture(req.params.id, req.params.sectionId, req.body);
  res.status(StatusCodes.CREATED).json(lecture);
});

export const updateLecture = asyncHandler(async (req: Request, res: Response) => {
  const lecture = await courseService.updateLecture(req.params.id, req.params.sectionId, req.params.lectureId, req.body);
  res.status(StatusCodes.OK).json(lecture);
});

export const deleteLecture = asyncHandler(async (req: Request, res: Response) => {
  const result = await courseService.deleteLecture(req.params.id, req.params.sectionId, req.params.lectureId);
  res.status(StatusCodes.OK).json(result);
});

// ─── Study Sections ────────────────────────────────────

export const listStudySections = asyncHandler(async (req: Request, res: Response) => {
  const sections = await courseService.listStudySections(req.params.id);
  res.status(StatusCodes.OK).json(sections);
});

export const createStudySection = asyncHandler(async (req: Request, res: Response) => {
  const section = await courseService.createStudySection(req.params.id, req.body);
  res.status(StatusCodes.CREATED).json(section);
});

export const getStudySectionById = asyncHandler(async (req: Request, res: Response) => {
  const section = await courseService.getStudySectionById(req.params.id, req.params.sectionId);
  res.status(StatusCodes.OK).json(section);
});

export const updateStudySection = asyncHandler(async (req: Request, res: Response) => {
  const section = await courseService.updateStudySection(req.params.id, req.params.sectionId, req.body);
  res.status(StatusCodes.OK).json(section);
});

export const deleteStudySection = asyncHandler(async (req: Request, res: Response) => {
  const result = await courseService.deleteStudySection(req.params.id, req.params.sectionId);
  res.status(StatusCodes.OK).json(result);
});

// ─── Categories ────────────────────────────────────────

export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await courseService.listCategories();
  res.status(StatusCodes.OK).json(categories);
});

// ─── Reviews ───────────────────────────────────────────

export const listReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await courseService.listReviews(req.query.courseId as string);
  res.status(StatusCodes.OK).json(reviews);
});

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await courseService.createReview(req.user!.id, req.body);
  res.status(StatusCodes.CREATED).json(review);
});

// ─── Enrollments ───────────────────────────────────────

export const listEnrollments = asyncHandler(async (req: Request, res: Response) => {
  const enrollments = await courseService.listEnrollments(req.user!.id);
  res.status(StatusCodes.OK).json(enrollments);
});

export const createEnrollment = asyncHandler(async (req: Request, res: Response) => {
  const enrollment = await courseService.createEnrollment(req.user!.id, req.body);
  res.status(StatusCodes.CREATED).json(enrollment);
});

export const getEnrollmentById = asyncHandler(async (req: Request, res: Response) => {
  const enrollment = await courseService.getEnrollmentById(req.user!.id, req.params.enrollmentId);
  res.status(StatusCodes.OK).json(enrollment);
});

export const updateProgress = asyncHandler(async (req: Request, res: Response) => {
  const progress = await courseService.updateProgress(req.user!.id, req.params.enrollmentId, req.body);
  res.status(StatusCodes.OK).json(progress);
});
