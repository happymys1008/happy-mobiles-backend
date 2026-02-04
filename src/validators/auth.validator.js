import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  mobile: z.string().trim().min(1, "Mobile is required"),
  password: z.string().min(1, "Password is required"),
});

export const loginSchema = z.object({
  mobile: z.string().trim().min(1, "Mobile is required"),
  password: z.string().min(1, "Password is required"),
});

export const customerRegisterSchema = z.object({
  name: z.string().trim().min(1).optional(),
  mobile: z.string().trim().min(1, "Mobile is required"),
  password: z.string().min(1, "Password is required"),
});

export const customerLoginSchema = z.object({
  mobile: z.string().trim().min(1, "Mobile is required"),
  password: z.string().min(1, "Password is required"),
});
