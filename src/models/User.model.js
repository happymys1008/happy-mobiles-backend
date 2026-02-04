import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    mobile: { type: String, unique: true },
    password: String,
    role: { type: String, default: "admin" }
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;