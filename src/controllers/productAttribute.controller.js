import ProductAttribute from "../models/ProductAttribute.model.js";
import { clearCache } from "../utils/appCache.js";

/* ================= GET ALL ATTRIBUTES ================= */
export const getAttributes = async (req, res) => {
  const attributes = await ProductAttribute.find().sort({ order: 1 });
  res.json(attributes);
};

/* ================= CREATE ATTRIBUTE ================= */
export const createAttribute = async (req, res) => {
  try {
    const { name } = req.body;

    // 🔴 REQUIRED CHECK
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Attribute name required" });
    }

    // 🔑 NORMALIZE
    const key = name.trim().toLowerCase();        // ram
    const displayName = name.trim().toUpperCase(); // RAM

    // 🔒 DUPLICATE BLOCK (KEY + NAME)
    const exists = await ProductAttribute.findOne({
      $or: [{ key }, { name: displayName }]
    });

    if (exists) {
      return res.status(400).json({ message: "Attribute already exists" });
    }

    // ✅ CREATE
    const attr = await ProductAttribute.create({
      key,
      name: displayName,
      values: []
    });

    clearCache("app:bootstrap");
    res.status(201).json(attr);
  } catch (err) {
    console.error("Create Attribute Error:", err);
    res.status(500).json({ message: "Failed to create attribute" });
  }
};

/* ================= ADD ATTRIBUTE VALUE ================= */
export const addAttributeValue = async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body;

    // 🔴 REQUIRED CHECK
    if (!value || !value.trim()) {
      return res.status(400).json({ message: "Value required" });
    }

    const attr = await ProductAttribute.findById(id);
    if (!attr) {
      return res.status(404).json({ message: "Attribute not found" });
    }

    // 🔒 NORMALIZE VALUE
    const normalizedValue = value.trim().toUpperCase(); // 4GB, 128GB, BLUE

    // 🔴 VALUE DUPLICATE BLOCK (CASE INSENSITIVE)
    const alreadyExists = attr.values
      .map(v => v.toUpperCase())
      .includes(normalizedValue);

    if (alreadyExists) {
      return res.status(400).json({ message: "Value already exists" });
    }

    // ✅ PUSH SAFE VALUE
    attr.values.push(normalizedValue);
    await attr.save();

    clearCache("app:bootstrap");
    res.json(attr);
  } catch (err) {
    console.error("Add Attribute Value Error:", err);
    res.status(500).json({ message: "Failed to add value" });
  }
};
