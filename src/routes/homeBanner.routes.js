import express from "express";
import multer from "multer";
import {
  getHomeBanners,
  createHomeBanner,
  toggleHomeBanner,
  deleteHomeBanner
} from "../controllers/homeBanner.controller.js";

const router = express.Router();

/* ✅ MEMORY STORAGE (PRO) */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/* ================= ROUTES ================= */
router.get("/", getHomeBanners);
router.post("/", upload.single("image"), createHomeBanner);

// ✅ ACTIVE TOGGLE
router.patch("/:id/toggle", toggleHomeBanner);

// 🗑️ DELETE (Mongo + Cloudinary)
router.delete("/:id", deleteHomeBanner);

export default router;
