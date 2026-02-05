import express from "express";
import User from "../models/User.model.js";

const router = express.Router();

/* GET ALL CUSTOMERS */
router.get("/", async (req, res, next) => {
  try {
    const customers = await User.find({ role: "customer" }).sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    next(err);
  }
});

export default router;