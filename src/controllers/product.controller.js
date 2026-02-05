import { listProducts } from "../services/product.service.js";
import Variant from "../models/Variant.model.js";
import Inventory from "../models/Inventory.model.js";

const parsePositiveInt = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

/* ================= PRODUCTS ================= */

export const getProducts = async (req, res, next) => {
  try {
    const page = parsePositiveInt(req.query.page);
    const limit = parsePositiveInt(req.query.limit);

    const products = await listProducts({ page, limit });

    res.json(products);
  } catch (err) {
    next(err);
  }
};

/* ================= VARIANTS ================= */

// GET variants of product
export const getVariantsByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const variants = await Variant.find({ productId });

    res.json(variants);
  } catch (err) {
    next(err);
  }
};

// CREATE variant
export const createVariant = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { attributes, mrp, sellingPrice, defaultImage } = req.body;

    const variant = await Variant.create({
      productId,
      attributes,
      mrp,
      sellingPrice,
      defaultImage
    });

    // 🔥 Auto create inventory (just like admin did)
    await Inventory.create({
      productId,
      variantId: variant._id,
      trackingType: req.body.trackingType,
      qty: 0,
      imeis: [],
      serials: []
    });

    res.status(201).json(variant);
  } catch (err) {
    next(err);
  }
};

// DELETE variant
export const deleteVariant = async (req, res, next) => {
  try {
    const { variantId } = req.params;

    const used = await Inventory.findOne({
      variantId,
      $or: [{ qty: { $gt: 0 } }, { imeis: { $not: { $size: 0 } } }]
    });

    if (used) {
      return res.status(400).json({
        message: "Inventory exists for this variant"
      });
    }

    await Variant.findByIdAndDelete(variantId);
    await Inventory.deleteOne({ variantId });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};