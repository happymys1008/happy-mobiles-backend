import { z } from "zod";

export const productCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  price: z.number().nonnegative("Price must be at least 0"),
  mrp: z.number().nonnegative("MRP must be at least 0").optional(),
  images: z.array(z.string().trim().min(1)).optional(),
  isAvailable: z.boolean().optional(),
});

export const productUpdateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  price: z.number().nonnegative().optional(),
  mrp: z.number().nonnegative().optional(),
  images: z.array(z.string().trim().min(1)).optional(),
  isAvailable: z.boolean().optional(),
});
