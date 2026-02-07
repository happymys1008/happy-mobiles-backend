import express from "express";

import {
  getProducts,
  createProduct,
  updateProduct,
  getVariantsByProduct,
  createVariant,
  deleteVariant,
  updateVariantPrice
} from "../controllers/product.controller.js";

const router = express.Router();

/* ================= PRODUCTS ================= */

// Get all products
router.get("/", getProducts);

// Create product
router.post("/", createProduct);


// Update product (EDIT PAGE)
router.put("/:productId", updateProduct);


/* ================= VARIANTS ================= */

// Get all variants of a product
router.get("/:productId/variants", getVariantsByProduct);

// Create variant for a product
router.post("/:productId/variants", createVariant);

// Update variant price (🔥 SINGLE SOURCE OF TRUTH)
router.put("/variants/:variantId/price", updateVariantPrice);

// Delete variant
router.delete("/variants/:variantId", deleteVariant);

export default router;
