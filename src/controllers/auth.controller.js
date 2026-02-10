import {
  sendCustomerOtp,
  verifyCustomerOtp,
  getCustomerById
} from "../services/auth.service.js";
import jwt from "jsonwebtoken";

/* ================= ADMIN (UNCHANGED) ================= */

import { loginUser, registerAdmin } from "../services/auth.service.js";

export const register = async (req, res, next) => {
  try {
    const { name, mobile, password } = req.body;
    await registerAdmin({ name, mobile, password });
    res.json({ message: "Admin created" });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { mobile, password } = req.body;
    const payload = await loginUser({ mobile, password });
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

/* ================= CUSTOMER OTP AUTH ================= */

export const sendOtpController = async (req, res, next) => {
  try {
    const { mobile } = req.body;
    await sendCustomerOtp(mobile);
    res.json({ message: "OTP sent" });
  } catch (err) {
    next(err);
  }
};

export const verifyOtpController = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;

    const user = await verifyCustomerOtp(mobile, otp);

    const token = jwt.sign(
      { id: user._id, role: "customer" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const meController = async (req, res, next) => {
  try {
    const user = await getCustomerById(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
};