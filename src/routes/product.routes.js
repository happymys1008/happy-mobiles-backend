import express from "express";

import {
  getProducts,
  getVariantsByProduct,
  createVariant,
  deleteVariant
} from "../controllers/product.controller.js";

const router = express.Router();

/* ================= PRODUCTS ================= */
router.get("/", getProducts);

/* ================= VARIANTS ================= */

// get all variants of a product
router.get("/:productId/variants", getVariantsByProduct);

// create variant for product
router.post("/:productId/variants", createVariant);

// delete variant
router.delete("/variants/:variantId", deleteVariant);

export default router;