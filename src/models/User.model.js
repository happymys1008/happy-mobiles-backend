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

// ✅ CUSTOMER STATUS (Single Source of Truth)
isActive: {
  type: Boolean,
  default: true
},

/* ===== CUSTOMER PROFILE FIELDS ===== */
email: {
  type: String,
  default: ""
},

secondaryPhone: {
  type: String,
  default: ""
},

dob: {
  type: String,
  default: ""
},

anniversary: {
  type: String,
  default: ""
},


/* ===== CUSTOMER ADDRESSES ===== */
addresses: [
  {
    id: String,
    name: String,
    phone: String,
    line1: String,
    line2: String,
    pincode: String,
    city: String,
    state: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }
],



// 🔐 OTP AUTH FIELDS
otp: String,
otpExpires: Date

  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;