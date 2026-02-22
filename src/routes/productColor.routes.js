import express from "express";
import multer from "multer";

import {
  createProductColor,
  getColorsByProduct,
  deleteProductColor,
  uploadColorImage,
  replaceColorImages     // ✅ ADD THIS
} from "../controllers/productColor.controller.js";

const router = express.Router();

/* ================= MULTER SETUP ================= */

const upload = multer({
  dest: "uploads/"   // temporary folder
});

/* ================= COLORS ================= */

// Create color under product
router.post("/:productId/colors", createProductColor);

// Get all colors of product
router.get("/:productId/colors", getColorsByProduct);

// Delete color
router.delete("/colors/:colorId", deleteProductColor);

// Replace color images
router.put("/colors/:colorId/replace-images", replaceColorImages);

/* ================= COLOR IMAGE UPLOAD ================= */

// 🔥 NEW ROUTE (Cloudinary)
router.post(
  "/upload-image",
  upload.single("image"),
  uploadColorImage
);

export default router;