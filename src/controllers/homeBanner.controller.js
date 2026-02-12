import HomeBanner from "../models/HomeBanner.js";
import imagekit from "../config/imagekit.js";
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

    /* 🔥 UPLOAD TO IMAGEKIT */
    const result = await imagekit.upload({
      file: req.file.buffer,
      fileName: req.file.originalname,
      folder: "home-banners",
    });

    const banner = await HomeBanner.create({
      title: req.body.title || "",
      imageUrl: result.url,
      imagekitFileId: result.fileId,   // 🔥 Important for delete
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

    /* 🗑️ DELETE FROM IMAGEKIT */
    if (banner.imagekitFileId) {
      await imagekit.deleteFile(banner.imagekitFileId);
    }

    await banner.deleteOne();

    clearCache("app:bootstrap");

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
