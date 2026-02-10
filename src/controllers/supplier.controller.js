import Supplier from "../models/Supplier.model.js";

/* =========================
   📦 GET ALL SUPPLIERS
========================= */
export const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find({ isActive: true })
      .sort({ name: 1 })
      .lean();

    res.json(suppliers);
  } catch (err) {
    next(err);
  }
};

/* =========================
   ➕ CREATE SUPPLIER
========================= */
export const createSupplier = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Supplier name is required"
      });
    }

    const exists = await Supplier.findOne({
      name: new RegExp(`^${name.trim()}$`, "i")
    });

    if (exists) {
      return res.status(400).json({
        message: "Supplier already exists"
      });
    }

    const supplier = await Supplier.create({
      name: name.trim()
    });

    res.status(201).json(supplier);
  } catch (err) {
    next(err);
  }
};
