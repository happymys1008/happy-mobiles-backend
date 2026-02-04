import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

/* ================= HELPERS ================= */

const createHttpError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* ================= ADMIN (UNCHANGED) ================= */

export const registerAdmin = async ({ name, mobile, password }) => {
  const exists = await User.findOne({ mobile });
  if (exists) throw createHttpError(400, "User already exists");

  const hashed = await bcrypt.hash(password, 10);

  return await User.create({
    name,
    mobile,
    password: hashed,
    role: "admin",
  });
};

export const loginUser = async ({ mobile, password }) => {
  const user = await User.findOne({ mobile });

  if (!user) throw createHttpError(401, "Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw createHttpError(401, "Invalid credentials");

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: {
      name: user.name,
      mobile: user.mobile,
      role: user.role,
    },
  };
};

/* ================= CUSTOMER OTP SYSTEM ================= */

export const sendCustomerOtp = async mobile => {
  let user = await User.findOne({ mobile });

  if (!user) {
    user = await User.create({
      name: `Customer ${mobile.slice(-4)}`,
      mobile,
      role: "customer",
    });
  }

  const otp = generateOtp();

  user.otp = await bcrypt.hash(otp, 10);
  user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

  await user.save();

  console.log("OTP (dev only):", otp); // later SMS gateway here

  return true;
};

export const verifyCustomerOtp = async (mobile, otp) => {
  const user = await User.findOne({ mobile, role: "customer" });

  if (!user || !user.otp) {
    throw createHttpError(400, "OTP not requested");
  }

  if (user.otpExpires < Date.now()) {
    throw createHttpError(400, "OTP expired");
  }

  const valid = await bcrypt.compare(otp, user.otp);
  if (!valid) throw createHttpError(400, "Invalid OTP");

  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  return user;
};

export const getCustomerById = async id => {
  const user = await User.findById(id).select("-otp -otpExpires -password");
  if (!user) throw createHttpError(404, "User not found");
  return user;
};