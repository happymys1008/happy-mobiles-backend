import { z } from "zod";

export const reserveInventorySchema = z.object({
  productId: z.string().trim().min(1, "productId is required"),
  variantId: z.string().trim().min(1, "variantId is required"),
  qty: z.number().int().min(1, "qty must be at least 1"),
});

export const adjustInventorySchema = z.object({
  productId: z.string().trim().min(1, "productId is required"),
  variantId: z.string().trim().min(1, "variantId is required"),
  qty: z.number().int().refine((v) => v !== 0, "qty must be non-zero"),
});

export const commitInventorySchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1, "productId is required"),
        variantId: z.string().trim().min(1, "variantId is required"),
        qty: z.number().int().min(1, "qty must be at least 1"),
      })
    )
    .min(1, "items are required"),
});
