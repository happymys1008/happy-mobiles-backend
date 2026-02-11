import HomeBanner from "../models/HomeBanner.js";
import cloudinary from "../config/cloudinary.js";
import { clearCache } from "../utils/appCache.js";

/* ================= GET ACTIVE BANNERS ================= */
export const getHomeBanners = async (req, res) => {
  const banners = await HomeBanner.find({ active: true }).sort({ order: 1 });
  res.json(banners);
};

/* ================= CREATE BANNER ================= */
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
      cloudinaryPublicId: result.public_id, // ✅ VERY IMPORTANT
      blurImageUrl: result.secure_url.replace(
        "/upload/",
        "/upload/e_blur:1000,q_10/"
      ),
      order: Number(req.body.order) || 1,
      active: true,
    });

    clearCache("app:bootstrap");

    res.status(201).json(banner);
  } catch (err) {
    console.error("❌ Banner upload error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= TOGGLE ACTIVE ================= */
export const toggleHomeBanner = async (req, res) => {
  try {
    const banner = await HomeBanner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    banner.active = !banner.active;
    await banner.save();

    clearCache("app:bootstrap");

    res.json({ success: true, active: banner.active });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE BANNER ================= */
export const deleteHomeBanner = async (req, res) => {
  try {
    const banner = await HomeBanner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    /* 🗑️ DELETE FROM CLOUDINARY */
    if (banner.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(banner.cloudinaryPublicId);
    }

    await banner.deleteOne();

    clearCache("app:bootstrap");

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
