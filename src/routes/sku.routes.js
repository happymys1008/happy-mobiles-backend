import express from "express";
import {
  createSKU,
  getSKUByColor,
  deleteSKU
} from "../controllers/sku.controller.js";

const router = express.Router();

/* ================= SKU ================= */

// Create SKU under color
router.post("/:productId/colors/:colorId/skus", createSKU);

// Get SKUs of a color
router.get("/colors/:colorId/skus", getSKUByColor);

// Delete SKU
router.delete("/:skuId", deleteSKU);

export default router;
