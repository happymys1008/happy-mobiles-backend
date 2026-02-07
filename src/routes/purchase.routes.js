import express from "express";
// ❌ AUTH & ROLE TEMPORARILY REMOVED (DEV MODE)
import { createPurchase } from "../controllers/purchase.controller.js";

const router = express.Router();

/**
 * ===============================
 * ADMIN PURCHASE (STOCK IN)
 * ===============================
 * POST /api/purchases
 * DEV MODE: auth disabled
 */
router.post(
  "/",
  createPurchase
);

export default router;
