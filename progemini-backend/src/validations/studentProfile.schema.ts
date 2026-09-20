import { z } from "zod";

export const updateStudentProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(1, "Contact phone number is required"),
    passport: z.string().min(1, "Passport number is required"),
    nationality: z.string().min(1, "Nationality is required"),
    address: z.string().min(1, "Address is required"),
    dateOfBirth: z.string().optional().nullable(),
    gender: z.string().optional().nullable(),
    nextOfKinName: z.string().optional().nullable(),
    nextOfKinRelationship: z
      .enum(["Father", "Mother", "Brother", "Sister", "Spouse", "Other"])
      .optional()
      .nullable()
      .or(z.literal("")),
    nextOfKinPhone: z.string().optional().nullable(),
    nextOfKinEmail: z.string().email("Invalid email format").optional().nullable().or(z.literal("")),
    avatar: z.string().optional().nullable(),
    bio: z.string().optional().nullable(),
  }),
});

export const adminUpdateStudentProfileSchema = z.object({
  params: z.object({
    userId: z.string().min(1, "User ID is required"),
  }),
  body: z.object({
    // Academic fields
    studentId: z.string().optional().nullable(),
    program: z.string().optional().nullable(),
    startedSemester: z
      .enum(["Fall", "Summer", "Spring"])
      .optional()
      .nullable()
      .or(z.literal("")),
    startedYear: z.string().optional().nullable(),

    // Personal & Identity fields
    name: z.string().optional(),
    phone: z.string().optional().nullable(),
    passport: z.string().optional().nullable(),
    nationality: z.string().optional().nullable(),
    dateOfBirth: z.string().optional().nullable(),
    gender: z.string().optional().nullable(),
    avatar: z.string().optional().nullable(),
    bio: z.string().optional().nullable(),

    // Next of Kin & Address
    nextOfKinName: z.string().optional().nullable(),
    nextOfKinRelationship: z
      .enum(["Father", "Mother", "Brother", "Sister", "Spouse", "Other"])
      .optional()
      .nullable()
      .or(z.literal("")),
    nextOfKinPhone: z.string().optional().nullable(),
    nextOfKinEmail: z.string().email("Invalid email format").optional().nullable().or(z.literal("")),
    address: z.string().optional().nullable(),

    // Official Verification
    isCompleted: z.boolean().optional(),
  }),
});

export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;
export type AdminUpdateStudentProfileInput = z.infer<typeof adminUpdateStudentProfileSchema>;
