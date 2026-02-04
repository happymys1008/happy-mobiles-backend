import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },

    mobile: {
      type: String,
      unique: true,
      required: true,
      index: true
    },

    password: String, // only for admin

    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer"
    },

    // 🔐 OTP AUTH FIELDS
    otp: String,
    otpExpires: Date
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;