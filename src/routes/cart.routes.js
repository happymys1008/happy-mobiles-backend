import express from "express";
import auth from "../middlewares/auth.middleware.js";

import {
  getCartController,
  addToCartController,
  updateCartItemController,
  removeCartItemController,
  clearCartController,
} from "../controllers/cart.controller.js";

const router = express.Router();

/* ================= CUSTOMER CART ================= */

/* 🔹 GET CART */
router.get("/", auth, getCartController);

/* 🔹 ADD ITEM */
router.post("/add", auth, addToCartController);

/* 🔹 UPDATE QTY */
router.put("/update", auth, updateCartItemController);

/* 🔹 REMOVE ITEM */
router.delete("/remove", auth, removeCartItemController);

/* 🔹 CLEAR CART */
router.delete("/clear", auth, clearCartController);

export default router;
