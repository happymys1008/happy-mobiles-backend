import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const createHttpError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

/* ================= ADMIN ================= */

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

/* ================= CUSTOMER (OTP BASED) ================= */

export const registerCustomer = async ({ name, mobile }) => {
  const exists = await User.findOne({ mobile });
  if (exists) return exists; // already hai to create mat karo

  return await User.create({
    name: name || `Customer ${mobile.slice(-4)}`,
    mobile,
    password: "OTP_LOGIN", // dummy value (not used)
    role: "customer",
  });
};

export const loginCustomer = async ({ mobile }) => {
  const user = await User.findOne({ mobile, role: "customer" });

  if (!user) throw createHttpError(401, "User not found");

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