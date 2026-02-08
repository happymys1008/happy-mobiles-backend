import express from "express";
import { getAllChildCategories } from "../controllers/childCategory.controller.js";

const router = express.Router();

router.get("/", getAllChildCategories);

export default router;
