import express from "express";
import User from "../models/User.model.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

/* ================= CUSTOMER UPDATE ================= */

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true }
    );

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= ADMIN — GET ALL CUSTOMERS ================= */

router.get("/admin/customers", async (req, res) => {
  try {
    const customers = await User.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;