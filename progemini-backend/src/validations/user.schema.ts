import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().optional().nullable(),
    bio: z.string().optional().nullable(),
    avatar: z.string().optional().nullable(),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["ADMIN", "STUDENT"]),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    bio: z.string().optional().nullable(),
    avatar: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
