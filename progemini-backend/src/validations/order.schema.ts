import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    courseId: z.string().uuid(),
    paymentMethod: z.string().optional(),
  }),
});

export const listOrdersSchema = z.object({
  query: z.object({}),
});
