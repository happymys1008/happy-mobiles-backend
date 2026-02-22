import mongoose from "mongoose";
import Product from "./Product.model.js";
import ProductColor from "./ProductColor.model.js";

const skuSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true
    },

    colorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductColor",
      default: null,
      index: true
    },

    // 🔥 FULLY DYNAMIC ATTRIBUTES
    attributes: {
      type: Map,
      of: String,
      default: {}
    },

    // 🔐 SAFE UNIQUE HASH (ORDER INDEPENDENT)
    attributeHash: {
      type: String,
      index: true
    },

    mrp: {
      type: Number,
      required: true
    },

    sellingPrice: {
      type: Number,
      required: true
    },

    skuCode: {
      type: String,
      unique: true,
      index: true
    }
  },
  { timestamps: true }
);

/* --------------------------------------------------
   🔒 UNIQUE COMBINATION (SAFE METHOD)
-------------------------------------------------- */
skuSchema.index(
  { productId: 1, colorId: 1, attributeHash: 1 },
  { unique: true }
);

/* --------------------------------------------------
   💰 Validation + Hash + Auto SKU Generator
-------------------------------------------------- */
skuSchema.pre("save", async function (next) {
  try {
    const product = await Product.findById(this.productId);
    if (!product) return next(new Error("Invalid Product"));

    const config = product.variantConfig || [];

    /* 🔎 Validate required attributes */
    for (const key of config) {
      if (key === "COLOR") continue;

      const lowerKey = key.toLowerCase();

      if (!this.attributes.get(lowerKey)) {
        return next(new Error(`${key} required`));
      }
    }

    /* 💰 Price validation */
    if (this.sellingPrice > this.mrp) {
      return next(
        new Error("Selling price cannot be greater than MRP")
      );
    }

    /* 🔥 Generate SAFE attributeHash */
    const sortedKeys = Array.from(this.attributes.keys()).sort();

    const hashString = sortedKeys
      .map(key => `${key}:${this.attributes.get(key)}`)
      .join("|");

    this.attributeHash = hashString;

    /* 🏷 Generate Dynamic SKU Code */
    if (!this.skuCode) {
      const parts = [product.slug];

      if (this.colorId) {
        const color = await ProductColor.findById(this.colorId);
        if (color) parts.push(color.colorName.toUpperCase());
      }

      for (const key of sortedKeys) {
        parts.push(
          String(this.attributes.get(key)).toUpperCase()
        );
      }

      this.skuCode = parts.join("-");
    }

    next();
  } catch (err) {
    next(err);
  }
});

const SKU = mongoose.model("SKU", skuSchema);
export default SKU;