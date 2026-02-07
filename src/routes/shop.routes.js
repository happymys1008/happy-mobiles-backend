import express from "express";
import { getShopProductsByCategory } from "../controllers/shop.controller.js";

const router = express.Router();

/**
 * CUSTOMER SHOP
 * GET /api/shop/:categorySlug
 */
router.get("/:categorySlug", getShopProductsByCategory);

export default router;
