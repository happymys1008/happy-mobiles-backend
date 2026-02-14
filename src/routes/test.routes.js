import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.model.js";

const router = express.Router();

router.get("/create-admin", async (req, res) => {
  try {
    const hashed = await bcrypt.hash("Happy@9982649982", 10);

    const admin = await User.create({
      name: "Narpat",
      mobile: "8880999566",
      password: hashed,
      role: "admin",
      isActive: true,
    });

    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
