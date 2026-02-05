import express from "express";
import {
  getCategories,
  createCategory,
  getSubCategories,
  createSubCategory,
  getChildCategories,
  createChildCategory
} from "../controllers/category.controller.js";

const router = express.Router();

router.get("/categories", getCategories);
router.post("/categories", createCategory);

router.get("/subcategories", getSubCategories);
router.post("/subcategories", createSubCategory);

router.get("/childcategories", getChildCategories);
router.post("/childcategories", createChildCategory);

export default router;