import express from "express";
import {
  getShopProductsByCategory
} from "../controllers/shop.controller.js";

import HomeSection from "../models/HomeSection.model.js";

const router = express.Router();

/* ======================================================
   🏠 CUSTOMER HOME SECTIONS
   GET /api/shop/home-sections
   ====================================================== */
router.get("/home-sections", async (req, res, next) => {
  try {
    const sections = await HomeSection.find({ active: true })
      .sort({ order: 1 })
      .lean();

    res.json(sections);
  } catch (err) {
    next(err);
  }
});

/* ======================================================
   🛍️ CUSTOMER CATEGORY PRODUCTS
   GET /api/shop/:categorySlug
   ====================================================== */
router.get("/:categorySlug", getShopProductsByCategory);

export default router;
