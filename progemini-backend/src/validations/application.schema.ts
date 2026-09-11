import { z } from "zod";

// ─── Applications ──────────────────────────────────────

const applicationStatusEnum = z.enum(["IN_REVIEW", "APPROVED", "REJECTED"]);

const applicationBaseFields = {
  courseId: z.string().uuid(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  nationality: z.string().min(1, "Nationality is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
  highestEducation: z.string().min(1, "Highest education is required"),
  institutionName: z.string().min(1, "Institution name is required"),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  graduationYear: z.string().min(1, "Graduation year is required"),
  gpa: z.string().nullable().optional(),
  englishProficiency: z.string().min(1, "English proficiency is required"),
  previousCourses: z.string().nullable().optional(),
  workExperience: z.string().nullable().optional(),
};

export const createApplicationSchema = z.object({
  body: z.object({
    ...applicationBaseFields,
    documentFiles: z.array(z.string().uuid()).optional(),
  }),
});

export const updateApplicationContentSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    ...applicationBaseFields,
    documentFiles: z.array(z.string().uuid()).optional(),
  }),
});

export const updateApplicationStatusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    status: applicationStatusEnum,
    adminFeedback: z.string().optional(),
  }),
});

export const applicationIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const checkApplicationQuerySchema = z.object({
  query: z.object({
    courseId: z.string().uuid("courseId is required"),
  }),
});

export const listApplicationsQuerySchema = z.object({
  query: z.object({
    status: applicationStatusEnum.optional(),
  }),
});

// ─── Enquiries ─────────────────────────────────────────

const enquiryStatusEnum = z.enum([
  "Pending",
  "In progress",
  "Done",
  "Need Sales to talk",
  "Need admission officer to talk",
]);

export const createEnquirySchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .min(2, "Name must be between 2 and 100 characters")
      .max(100, "Name must be between 2 and 100 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    country: z.string().min(1, "Country is required"),
    submitterType: z.string().min(1, "Submitter type is required"),
    enquiryType: z.string().min(1, "Enquiry type is required"),
    courseName: z.string().optional(),
    message: z
      .string()
      .min(10, "Message must be between 10 and 2000 characters")
      .max(2000, "Message must be between 10 and 2000 characters"),
  }),
});

export const updateEnquiryStatusSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    status: enquiryStatusEnum,
  }),
});

export const enquiryIdParamSchema = z.object({
  params: z.object({ id: z.string() }),
});

export const listEnquiriesQuerySchema = z.object({
  query: z.object({
    status: z.string().optional(),
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(20).optional(),
  }),
});

// ─── Contact (stub) ────────────────────────────────────

export const contactFormSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be between 2 and 100 characters")
      .max(100, "Name must be between 2 and 100 characters"),
    email: z.string().email("Invalid email format"),
    subject: z.string().min(1, "Subject is required"),
    message: z
      .string()
      .min(10, "Message must be between 10 and 2000 characters")
      .max(2000, "Message must be between 10 and 2000 characters"),
  }),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationContentInput = z.infer<typeof updateApplicationContentSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
export type CheckApplicationQuery = z.infer<typeof checkApplicationQuerySchema>;
export type ListApplicationsQuery = z.infer<typeof listApplicationsQuerySchema>;
export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;
export type UpdateEnquiryStatusInput = z.infer<typeof updateEnquiryStatusSchema>;
export type ListEnquiriesQuery = z.infer<typeof listEnquiriesQuerySchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
