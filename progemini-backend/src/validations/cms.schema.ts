import { z } from "zod";

// ─── Shared ────────────────────────────────────────────

export const listCmsQuerySchema = z.object({
  query: z.object({
    all: z.string().optional(),
  }),
});

export const uuidParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

// ─── Consultants ───────────────────────────────────────

export const createConsultantSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    designation: z.string().min(1, "Designation is required"),
    extensions: z.string().optional(),
    email: z.string().email("Invalid email").optional(),
    linkedIn: z.string().optional(),
    imageUrl: z.string().optional(),
    profile: z.record(z.unknown()).optional(),
    order: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateConsultantSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(1).optional(),
    designation: z.string().min(1).optional(),
    extensions: z.string().nullable().optional(),
    email: z.string().email("Invalid email").nullable().optional(),
    linkedIn: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
    profile: z.record(z.unknown()).nullable().optional(),
    order: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

// ─── Academic Team ─────────────────────────────────────

export const createAcademicMemberSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    designation: z.string().min(1, "Designation is required"),
    extensions: z.string().optional(),
    email: z.string().email("Invalid email").optional(),
    linkedIn: z.string().optional(),
    imageUrl: z.string().optional(),
    profile: z.record(z.unknown()).optional(),
    order: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateAcademicMemberSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(1).optional(),
    designation: z.string().min(1).optional(),
    extensions: z.string().nullable().optional(),
    email: z.string().email("Invalid email").nullable().optional(),
    linkedIn: z.string().nullable().optional(),
    imageUrl: z.string().nullable().optional(),
    profile: z.record(z.unknown()).nullable().optional(),
    order: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

// ─── Partner Universities ──────────────────────────────

export const createPartnerUniversitySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    logoUrl: z.string().optional(),
    websiteUrl: z.string().optional(),
    description: z.record(z.unknown()).optional(),
    order: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updatePartnerUniversitySchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(1).optional(),
    logoUrl: z.string().nullable().optional(),
    websiteUrl: z.string().nullable().optional(),
    description: z.record(z.unknown()).nullable().optional(),
    order: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

// ─── Hero Slides ───────────────────────────────────────

export const createHeroSlideSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    eyebrow: z.string().optional(),
    description: z.string().optional(),
    imageUrl: z.string().min(1, "Image URL is required"),
    order: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateHeroSlideSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    title: z.string().min(1).optional(),
    eyebrow: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    imageUrl: z.string().optional(),
    order: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

// ─── Senior Profiles ───────────────────────────────────

const heroItemSchema = z.object({
  label: z.string(),
  value: z.string(),
  selected: z.boolean(),
});

export const createSeniorProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required").toLowerCase().trim(),
    position: z.string().min(1, "Position is required"),
    quality: z.string().optional(),
    description: z.string().optional(),
    imageUrlDesktop: z.string().optional(),
    imageUrlMobile: z.string().optional(),
    objectPos: z.string().optional(),
    linkedin: z.string().optional(),
    heroItems: z.array(heroItemSchema).optional(),
    fullDescriptionHTML: z.string().optional(),
    sideDescription1HTML: z.string().optional(),
    sideDescription2HTML: z.string().optional(),
    order: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateSeniorProfileSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(1).optional(),
    slug: z.string().min(1).toLowerCase().trim().optional(),
    position: z.string().min(1).optional(),
    quality: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    imageUrlDesktop: z.string().nullable().optional(),
    imageUrlMobile: z.string().nullable().optional(),
    objectPos: z.string().nullable().optional(),
    linkedin: z.string().nullable().optional(),
    heroItems: z.array(heroItemSchema).nullable().optional(),
    fullDescriptionHTML: z.string().nullable().optional(),
    sideDescription1HTML: z.string().nullable().optional(),
    sideDescription2HTML: z.string().nullable().optional(),
    order: z.number().optional(),
    isActive: z.boolean().optional(),
  }),
});

export type ListCmsQuery = z.infer<typeof listCmsQuerySchema>;
export type CreateConsultantInput = z.infer<typeof createConsultantSchema>;
export type UpdateConsultantInput = z.infer<typeof updateConsultantSchema>;
export type CreateAcademicMemberInput = z.infer<typeof createAcademicMemberSchema>;
export type UpdateAcademicMemberInput = z.infer<typeof updateAcademicMemberSchema>;
export type CreatePartnerUniversityInput = z.infer<typeof createPartnerUniversitySchema>;
export type UpdatePartnerUniversityInput = z.infer<typeof updatePartnerUniversitySchema>;
export type CreateHeroSlideInput = z.infer<typeof createHeroSlideSchema>;
export type UpdateHeroSlideInput = z.infer<typeof updateHeroSlideSchema>;
export type CreateSeniorProfileInput = z.infer<typeof createSeniorProfileSchema>;
export type UpdateSeniorProfileInput = z.infer<typeof updateSeniorProfileSchema>;
