import express from "express";
import ProductAttribute from "../models/ProductAttribute.model.js";

const router = express.Router();

/* GET ALL */
router.get("/", async (req, res) => {
  const data = await ProductAttribute.find().sort({ order: 1 });
  res.json(data);
});

/* CREATE ATTRIBUTE */
router.post("/", async (req, res) => {
  const name = req.body.name.trim().toUpperCase();
  const key = name.toLowerCase();

  const exists = await ProductAttribute.findOne({ key });
  if (exists) {
    return res.status(400).json({ message: "Already exists" });
  }

  const attr = await ProductAttribute.create({
    name,
    key
  });

  res.json(attr);
});

/* ADD VALUE (🔥 MAIN PART) */
router.post("/:id/value", async (req, res) => {
  const { value } = req.body;

  const attr = await ProductAttribute.findById(req.params.id);
  if (!attr) return res.status(404).json({ message: "Not found" });

  if (!attr.values.includes(value)) {
    attr.values.push(value);
    await attr.save();
  }

  res.json(attr);
});

export default router;
