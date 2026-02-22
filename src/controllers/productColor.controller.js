import ProductColor from "../models/ProductColor.model.js";
import Product from "../models/Product.model.js";
import cloudinary from "../config/cloudinary.js";

/* ================= CREATE COLOR ================= */
export const createProductColor = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { colorName, images } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    /* 🔒 BLOCK COLOR FOR NON-VARIANT PRODUCT */
    if (!product.hasVariants) {
      return res.status(400).json({
        message: "This product does not support variants."
      });
    }

    /* 🔒 PREVENT DUPLICATE COLOR */
    const existingColor = await ProductColor.findOne({
      productId,
      colorName
    });

    if (existingColor) {
      return res.status(409).json({
        message: "Color already exists for this product."
      });
    }

    const color = await ProductColor.create({
      productId,
      colorName,
      images
    });

    res.status(201).json(color);
  } catch (err) {
    next(err);
  }
};
/* ================= GET COLORS ================= */
export const getColorsByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const colors = await ProductColor.find({ productId });
    res.json(colors);
  } catch (err) {
    next(err);
  }
};

/* ================= DELETE COLOR ================= */
export const deleteProductColor = async (req, res, next) => {
  try {
    const { colorId } = req.params;

    const color = await ProductColor.findById(colorId);
    if (!color) {
      return res.status(404).json({ message: "Color not found" });
    }

    // 🔥 Delete images from cloudinary
    for (const img of color.images) {
      if (img.cloudinaryPublicId) {
        await cloudinary.uploader.destroy(img.cloudinaryPublicId);
      }
    }

    await ProductColor.findByIdAndDelete(colorId);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

/* ================= UPLOAD COLOR IMAGE ================= */
export const uploadColorImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Image file is required"
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "happy-ivan/product-colors"
    });

    return res.json({
      imageUrl: result.secure_url,
      cloudinaryPublicId: result.public_id
    });
  } catch (err) {
    console.error("COLOR IMAGE UPLOAD ERROR:", err);
    next(err);
  }
};

/* ================= REPLACE COLOR IMAGES ================= */
export const replaceColorImages = async (req, res, next) => {
  try {
    const { colorId } = req.params;
    const { images: newImages } = req.body;

    const color = await ProductColor.findById(colorId);

    if (!color) {
      return res.status(404).json({ message: "Color not found" });
    }

    const oldImages = color.images || [];

    // 🔥 Find removed images (compare by publicId)
    const removedImages = oldImages.filter(oldImg =>
      !newImages.some(newImg =>
        newImg.cloudinaryPublicId === oldImg.cloudinaryPublicId
      )
    );

    // 🔥 Delete ONLY removed images
    for (const img of removedImages) {
      if (img.cloudinaryPublicId) {
        await cloudinary.uploader.destroy(img.cloudinaryPublicId);
      }
    }

    // ✅ Update DB with new images
    color.images = newImages;
    await color.save();

    res.json({ success: true, color });

  } catch (err) {
    console.error("REPLACE COLOR IMAGES ERROR:", err);
    next(err);
  }
};