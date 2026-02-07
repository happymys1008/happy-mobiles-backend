import express from "express";
import {
  getAttributes,
  createAttribute,
  addAttributeValue
} from "../controllers/productAttribute.controller.js";

const router = express.Router();

router.get("/", getAttributes);
router.post("/", createAttribute);
router.post("/:key/value", addAttributeValue);

export default router;
