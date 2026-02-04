import { z } from "zod";

export const createOrderSchema = z.object({
  customerId: z.string().trim().min(1, "customerId is required"),
  customerName: z.string().trim().optional(),
  customerMobile: z.string().trim().optional(),
  deliveryAddress: z
    .object({
      name: z.string().trim().optional(),
      phone: z.string().trim().optional(),
      line1: z.string().trim().optional(),
      line2: z.string().trim().optional(),
      city: z.string().trim().optional(),
      state: z.string().trim().optional(),
      pincode: z.string().trim().optional(),
    })
    .optional(),
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1, "productId is required"),
        variantId: z.string().trim().optional(),
        name: z.string().trim().optional(),
        qty: z.number().int().min(1, "qty must be at least 1"),
        price: z.number().min(0, "price must be non-negative"),
      })
    )
    .min(1, "items are required"),
  total: z.number().min(0, "total is required"),
  shippingCharge: z.number().min(0).optional(),
  grandTotal: z.number().min(0).optional(),
  paymentMode: z.enum(["COD", "ONLINE"]),
  paymentStatus: z.enum(["PENDING", "PAID"]).optional(),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().trim().min(1, "orderId is required"),
  razorpay_order_id: z.string().trim().min(1, "razorpay_order_id is required"),
  razorpay_payment_id: z
    .string()
    .trim()
    .min(1, "razorpay_payment_id is required"),
  razorpay_signature: z
    .string()
    .trim()
    .min(1, "razorpay_signature is required"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "CREATED",
    "PAID",
    "PACKED",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
});
