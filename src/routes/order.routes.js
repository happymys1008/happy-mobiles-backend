import express from "express";
import {
  createOrderController,
  getOrderController,
  listOrdersController,
  updateOrderStatusController,
  verifyPaymentController,
} from "../controllers/order.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  verifyPaymentSchema,
} from "../validators/order.validator.js";

const router = express.Router();

router.post("/", validate(createOrderSchema), createOrderController);
router.post("/verify", validate(verifyPaymentSchema), verifyPaymentController);
router.get("/", listOrdersController);
router.get("/:id", getOrderController);
router.patch(
  "/:id/status",
  validate(updateOrderStatusSchema),
  updateOrderStatusController
);

export default router;
