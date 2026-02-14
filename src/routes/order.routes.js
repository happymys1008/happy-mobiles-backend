import express from "express";
import auth from "../middlewares/auth.middleware.js";
import {
  createOrderController,
  getOrderController,
  listOrdersController,
  updateOrderStatusController,
  verifyPaymentController,
  getMyOrdersController,
  createRazorpayOrderController   // ✅ ADD THIS
} from "../controllers/order.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  verifyPaymentSchema,
} from "../validators/order.validator.js";

const router = express.Router();

/* ================= CUSTOMER ================= */

// Create Order
router.post("/", auth, validate(createOrderSchema), createOrderController);

// Verify Razorpay Payment
router.post(
  "/verify",
  auth,
  validate(verifyPaymentSchema),
  verifyPaymentController
);

// Get My Orders
router.get("/my", auth, getMyOrdersController);

// Create Razorpay Order (🔥 NEW ROUTE)
router.post("/:id/razorpay", auth, createRazorpayOrderController);


/* ================= ADMIN ================= */

// List All Orders
router.get("/", auth, listOrdersController);

// Get Single Order
router.get("/:id", auth, getOrderController);

// Update Order Status
router.patch(
  "/:id/status",
  auth,
  validate(updateOrderStatusSchema),
  updateOrderStatusController
);

export default router;
