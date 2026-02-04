import express from "express";
import {
  getInventory,
  getLowStockInventory,
  adjustInventoryController,
  commitInventoryController,
  reserveInventoryController,
} from "../controllers/inventory.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  adjustInventorySchema,
  commitInventorySchema,
  reserveInventorySchema,
} from "../validators/inventory.validator.js";

const router = express.Router();

router.get("/", getInventory);
router.get("/low-stock", getLowStockInventory);
router.post("/reserve", validate(reserveInventorySchema), reserveInventoryController);
router.post("/adjust", validate(adjustInventorySchema), adjustInventoryController);
router.post("/commit", validate(commitInventorySchema), commitInventoryController);

export default router;
