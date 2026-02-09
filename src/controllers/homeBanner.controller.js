import HomeBanner from "../models/HomeBanner.js";
import cloudinary from "../config/cloudinary.js";
import { clearCache } from "../utils/appCache.js";

export const getHomeBanners = async (req, res) => {
  const banners = await HomeBanner.find({ active: true }).sort({ order: 1 });
  res.json(banners);
};

export const createHomeBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image missing" });
    }

    /* 🔥 BUFFER → CLOUDINARY */
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "home-banners" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        )
        .end(req.file.buffer);
    });

    const banner = await HomeBanner.create({
      title: req.body.title || "",
      imageUrl: result.secure_url,
      blurImageUrl: result.secure_url.replace(
        "/upload/",
        "/upload/e_blur:1000,q_10/"
      ),
      order: Number(req.body.order) || 1,
      active: true,
    });

    /* 🧹 CLEAR BOOTSTRAP CACHE (STEP-2 PART-C) */
    clearCache("app:bootstrap");

    res.status(201).json(banner);
  } catch (err) {
    console.error("❌ Banner upload error:", err);
    res.status(500).json({ message: err.message });
  }
};
