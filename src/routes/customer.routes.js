import express from "express";
import User from "../models/User.model.js";

const router = express.Router();

/* ================= GET ALL CUSTOMERS ================= */
router.get("/", async (req, res, next) => {
  try {
    const customers = await User.find({ role: "customer" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(customers);
  } catch (err) {
    next(err);
  }
});

/* ================= GET SINGLE CUSTOMER ================= */
router.get("/:id", async (req, res, next) => {
  try {
    const customer = await User.findById(req.params.id)
      .select("-password");

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);   // 🔥 includes addresses automatically
  } catch (err) {
    next(err);
  }
});

export default router;
