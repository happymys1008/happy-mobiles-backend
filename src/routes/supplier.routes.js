import express from "express";
import {
  getSuppliers,
  createSupplier
} from "../controllers/supplier.controller.js";

const router = express.Router();

/* =========================
   📦 SUPPLIERS
========================= */

// GET → list suppliers
router.get("/", getSuppliers);

// POST → create supplier
router.post("/", createSupplier);

export default router;
