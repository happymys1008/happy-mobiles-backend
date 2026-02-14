import express from "express";
import ProfileSchema from "../models/ProfileSchema.model.js";

const router = express.Router();

/* ================= DEFAULT SCHEMA ================= */
const DEFAULT_SCHEMA = {
  _version: 1,
  firstName: { enabled: true, required: true },
  lastName: { enabled: true, required: false },
  email: { enabled: true, required: true },
  address: { enabled: true, required: true },
  secondaryPhone: { enabled: false, required: false },
  dob: { enabled: false, required: false },
  anniversary: { enabled: false, required: false }
};

/* ================= GET SCHEMA ================= */
router.get("/", async (req, res) => {
  try {
    let schema = await ProfileSchema.findOne();

    // 🔥 AUTO CREATE (MAIN FIX)
    if (!schema) {
      schema = await ProfileSchema.create({
        schema: DEFAULT_SCHEMA
      });
    }

    res.json(schema.schema);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= UPDATE SCHEMA ================= */
router.put("/", async (req, res) => {
  try {
    let schema = await ProfileSchema.findOne();

    if (!schema) {
      schema = await ProfileSchema.create({
        schema: req.body
      });
    } else {
      schema.schema = req.body;
      await schema.save();
    }

    res.json(schema.schema);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
