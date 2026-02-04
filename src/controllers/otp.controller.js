import User from "../models/User.model.js";
import jwt from "jsonwebtoken";

const otpStore = new Map(); // dev only

export const sendOtpController = async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) return res.status(400).json({ message: "Mobile required" });

  const otp = "123456"; // dev fixed OTP

  otpStore.set(mobile, otp);

  console.log("OTP (dev):", otp);

  res.json({ message: "OTP sent" });
};

export const verifyOtpController = async (req, res) => {
  const { mobile, otp } = req.body;

  const saved = otpStore.get(mobile);
  if (!saved) return res.status(400).json({ message: "OTP not requested" });
  if (saved !== otp) return res.status(400).json({ message: "Invalid OTP" });

  otpStore.delete(mobile);

  let user = await User.findOne({ mobile });

  if (!user) {
    user = await User.create({
      mobile,
      role: "customer",
      name: `Customer ${mobile.slice(-4)}`
    });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: {
      name: user.name,
      mobile: user.mobile,
      role: user.role
    }
  });
};

export const meController = async (req, res) => {
  res.status(401).json({ message: "Not implemented yet" });
};