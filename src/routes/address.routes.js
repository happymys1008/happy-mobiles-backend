import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import User from "../models/User.model.js";

const router = express.Router();

/* ================= GET ADDRESSES ================= */
router.get("/", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user.addresses || []);
});

/* ================= ADD ADDRESS ================= */
router.post("/", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);

  const newAddress = {
    ...req.body,
    id: Date.now().toString(),
    isDefault: !!req.body.isDefault,
  };

  // 🔥 single default rule
  if (newAddress.isDefault) {
    user.addresses?.forEach(a => {
      a.isDefault = false;
    });
  }

  // 🔥 first address auto default
  if (!user.addresses || user.addresses.length === 0) {
    newAddress.isDefault = true;
  }

  user.addresses = [...(user.addresses || []), newAddress];

  await user.save();

  res.json(newAddress);
});

/* ================= UPDATE ADDRESS ================= */
router.put("/:id", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);

  // 🔥 if set default → unset others
  if (req.body.isDefault) {
    user.addresses.forEach(a => {
      a.isDefault = false;
    });
  }

  user.addresses = user.addresses.map(a =>
    a.id === req.params.id
      ? { ...a, ...req.body }
      : a
  );

  await user.save();

  res.json({ success: true });
});

/* ================= DELETE ADDRESS ================= */
router.delete("/:id", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);

  const deleted = user.addresses.find(
    a => a.id === req.params.id
  );

  let remaining = user.addresses.filter(
    a => a.id !== req.params.id
  );

  // 🔥 if default deleted → auto set next default
  if (deleted?.isDefault && remaining.length) {
    remaining[0].isDefault = true;
  }

  user.addresses = remaining;

  await user.save();

  res.json({ success: true });
});

export default router;
