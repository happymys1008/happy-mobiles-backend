import { z } from "zod";

/* ===============================
   CREATE PRODUCT VALIDATION
================================ */

export const productCreateSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),

    hasVariants: z.boolean(),

    price: z.number().nonnegative("Price must be at least 0").optional(),
    mrp: z.number().nonnegative("MRP must be at least 0").optional(),

    images: z.array(z.string().trim().min(1)).optional(),
    isAvailable: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // ❌ VARIANT PRODUCT → PRICE NOT ALLOWED
    if (data.hasVariants === true) {
      if (data.price !== undefined || data.mrp !== undefined) {
        ctx.addIssue({
          path: ["price"],
          message: "Price should be set in variants, not in product",
          code: z.ZodIssueCode.custom,
        });
      }
    }

    // ❌ NON-VARIANT PRODUCT → PRICE REQUIRED
    if (data.hasVariants === false) {
      if (data.price == null || data.mrp == null) {
        ctx.addIssue({
          path: ["price"],
          message: "Price & MRP are required when variants are disabled",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

/* ===============================
   UPDATE PRODUCT VALIDATION
================================ */

export const productUpdateSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    hasVariants: z.boolean().optional(),

    price: z.number().nonnegative().optional(),
    mrp: z.number().nonnegative().optional(),

    images: z.array(z.string().trim().min(1)).optional(),
    isAvailable: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.hasVariants === true) {
      if (data.price !== undefined || data.mrp !== undefined) {
        ctx.addIssue({
          path: ["price"],
          message: "Variant products cannot have price on product",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });
