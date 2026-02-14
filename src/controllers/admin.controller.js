import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.model.js";

/* ================= ADMIN LOGIN ================= */

export const adminLoginController = async (req, res, next) => {
  try {
    const { mobile, password } = req.body;

    const admin = await User.findOne({
      mobile,
      role: "admin"
    });

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      name: admin.name,
      mobile: admin.mobile,
      role: admin.role
    });

  } catch (err) {
    next(err);
  }
};

/* ================= ADMIN ME ================= */

export const adminMeController = async (req, res) => {
  res.json({
    name: req.admin.name,
    mobile: req.admin.mobile,
    role: req.admin.role
  });
};

/* ================= ADMIN LOGOUT ================= */

export const adminLogoutController = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production"
  });

  res.json({ message: "Admin logged out" });
};
