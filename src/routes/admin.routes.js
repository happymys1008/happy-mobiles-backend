import express from "express";
import {
  adminLoginController,
  adminMeController,
  adminLogoutController
} from "../controllers/admin.controller.js";

import adminAuth from "../middlewares/adminAuth.middleware.js";

const router = express.Router();

router.post("/login", adminLoginController);
router.get("/me", adminAuth, adminMeController);
router.post("/logout", adminAuth, adminLogoutController);

export default router;
