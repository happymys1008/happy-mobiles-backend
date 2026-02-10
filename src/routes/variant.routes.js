import express from "express";
import {
  getVariantsByProduct,
  updateVariant
} from "../controllers/variant.controller.js";

const router = express.Router();

router.get("/product/:productId", getVariantsByProduct);
router.put("/:id", updateVariant);

export default router;
