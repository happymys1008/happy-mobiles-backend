import SKU from "../models/SKU.model.js";
import Inventory from "../models/Inventory.model.js";
import Product from "../models/Product.model.js";
import ProductColor from "../models/ProductColor.model.js";

/* ================= CREATE SKU ================= */
export const createSKU = async (req, res, next) => {
  try {
    const { productId, colorId } = req.params;
    const { mrp, sellingPrice, attributes = {} } = req.body;

    /* 🔎 Validate product */
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!product.hasVariants) {
      return res.status(400).json({
        message: "This product does not support variants."
      });
    }

    /* 🔎 Validate color */
    const color = await ProductColor.findById(colorId);
    if (!color) {
      return res.status(404).json({ message: "Color not found" });
    }

    /* 🔎 Validate required attributes based on variantConfig */
    const config = product.variantConfig || [];

    for (const key of config) {
      if (key === "COLOR") continue;

      const lowerKey = key.toLowerCase();

      if (!attributes[lowerKey]) {
        return res.status(400).json({
          message: `${key} is required`
        });
      }
    }

    /* 🔐 Generate attributeHash (ORDER SAFE) */
    const sortedKeys = Object.keys(attributes).sort();

    const attributeHash = sortedKeys
      .map(key => `${key}:${attributes[key]}`)
      .join("|");

    /* 🔒 Duplicate check */
    const existingSku = await SKU.findOne({
      productId,
      colorId,
      attributeHash
    });

    if (existingSku) {
      return res.status(409).json({
        message: "SKU already exists for this combination."
      });
    }

    /* ✅ Create SKU */
    const sku = await SKU.create({
      productId,
      colorId,
      attributes,
      mrp,
      sellingPrice
    });

    return res.status(201).json({
      success: true,
      data: sku
    });

  } catch (err) {
    next(err);
  }
};

/* ================= GET SKU BY COLOR ================= */
export const getSKUByColor = async (req, res, next) => {
  try {
    const { colorId } = req.params;
    const skus = await SKU.find({ colorId });
    res.json(skus);
  } catch (err) {
    next(err);
  }
};

/* ================= DELETE SKU ================= */
export const deleteSKU = async (req, res, next) => {
  try {
    const { skuId } = req.params;

    await SKU.findByIdAndDelete(skuId);
    await Inventory.deleteOne({ skuId });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};