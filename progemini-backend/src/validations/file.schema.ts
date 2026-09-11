import { z } from "zod";

export const listFilesQuerySchema = z.object({
  query: z.object({
    applicationId: z.string().optional(),
    fileType: z.string().optional(),
    onlyMyFiles: z.string().optional(),
  }),
});

export const fileIdParamSchema = z.object({
  params: z.object({ id: z.string() }),
});

export const updateFileSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    fileName: z.string().optional(),
    fileType: z.string().optional(),
    applicationId: z.string().nullable().optional(),
  }),
});
