import express from "express";
import { getAppBootstrap } from "../controllers/app.controller.js";

const router = express.Router();

router.get("/bootstrap", getAppBootstrap);

export default router;
