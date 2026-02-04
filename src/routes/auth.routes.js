import express from "express";

import {
  sendOtpController,
  verifyOtpController,
  meController
} from "../controllers/otp.controller.js";

import {
  getCustomerProfile,
  updateCustomerProfile
} from "../controllers/customer.controller.js";

const router = express.Router();

/* ========== AUTH ========== */
router.post("/customer/send-otp", sendOtpController);
router.post("/customer/verify-otp", verifyOtpController);
router.get("/customer/me", meController);

/* ========== CUSTOMER PROFILE ========== */
router.get("/customer/profile", getCustomerProfile);
router.put("/customer/profile", updateCustomerProfile);

export default router;