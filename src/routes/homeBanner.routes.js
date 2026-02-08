import express from "express";
import multer from "multer";
import {
  getHomeBanners,
  createHomeBanner,
} from "../controllers/homeBanner.controller.js";

const router = express.Router();

/* ✅ MEMORY STORAGE (PRO) */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.get("/", getHomeBanners);
router.post("/", upload.single("image"), createHomeBanner);

export default router;
