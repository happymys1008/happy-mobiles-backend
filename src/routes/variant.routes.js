import express from "express";
import { updateVariant } from "../controllers/variant.controller.js";

const router = express.Router();

router.put("/:id", updateVariant);

export default router;
