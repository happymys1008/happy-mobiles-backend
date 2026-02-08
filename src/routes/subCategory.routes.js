import express from "express";
import { getAllSubCategories } from "../controllers/subCategory.controller.js";

const router = express.Router();

router.get("/", getAllSubCategories);

export default router;
