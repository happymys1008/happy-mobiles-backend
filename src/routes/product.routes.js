import multer from "multer";
import express from "express";

import {
  getProducts,
  createProduct,
  updateProduct,
  getProductById,
  uploadProductImage
} from "../controllers/product.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

/* ================= PRODUCTS ================= */

// Upload product image
router.post(
  "/image/upload",
  upload.single("image"),
  uploadProductImage
);

// Get all products
router.get("/", getProducts);

// Get single product by ID
router.get("/:productId", getProductById);

// Create product
router.post("/", createProduct);

// Update product
router.put("/:productId", updateProduct);

export default router;
