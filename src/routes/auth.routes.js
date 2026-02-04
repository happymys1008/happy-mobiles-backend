import express from "express";
import {
  login,
  register,
  customerAuthController,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  loginSchema,
  registerSchema,
  customerLoginSchema,
  customerRegisterSchema,
} from "../validators/auth.validator.js";

const router = express.Router();

/* ADMIN */
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

/* CUSTOMER SMART AUTH (LOGIN + AUTO REGISTER) */
router.post(
  "/customer/auth",
  validate(customerLoginSchema), 
  customerAuthController
);

export default router;