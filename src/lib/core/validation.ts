import { z } from "zod/v4";

export const militaryIdSchema = z.string().min(4).max(20);

export const passwordSchema = z.string().min(6).max(100);

export const loginSchema = z.object({
  militaryId: militaryIdSchema,
  password: passwordSchema,
});

export const specialtySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  order: z.number().int().min(0).default(0),
});

export const branchSchema = z.object({
  specialtyId: z.string().min(1),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
});

export const lessonSchema = z.object({
  branchId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  order: z.number().int().min(0).default(0),
});

export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(result.error.toString());
  }
  return result.data;
}
