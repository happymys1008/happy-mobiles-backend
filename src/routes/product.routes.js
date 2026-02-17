import multer from "multer";
import express from "express";

import {
  getProducts,
  createProduct,
  updateProduct,
  getProductById,   // 🔥 ADD THIS
  getVariantsByProduct,
  createVariant,
  deleteVariant,
  updateVariantPrice,
  uploadProductImage
} from "../controllers/product.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});


/* ================= PRODUCTS ================= */


// 🔥 Upload product image
router.post("/image/upload", upload.single("image"), uploadProductImage);
// Get all products
router.get("/", getProducts);


// 🔥 Get single product by ID
router.get("/:productId", getProductById);


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
