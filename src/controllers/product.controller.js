import Variant from "../models/Variant.model.js";
import Inventory from "../models/Inventory.model.js";
import Product from "../models/Product.model.js";
import { listProducts, createProductWithDefaultVariant } from "../services/product.service.js";

/* ================= PRODUCTS ================= */

export const getProducts = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 100;

    const products = await listProducts({ page, limit });

    res.json(products);
  } catch (err) {
    next(err);
  }
};


/* ================= CREATE PRODUCT ================= */

export const createProduct = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    // ✅ VARIANT FLAG NORMALIZATION
    if (typeof payload.allowVariants !== "boolean") {
      payload.allowVariants = Boolean(payload.enableVariants);
    }

    // ✅ PRICE FIELD NORMALIZATION (IMPORTANT FIX)
    if (payload.price != null && payload.sellingPrice == null) {
      payload.sellingPrice = payload.price;
      delete payload.price;
    }

    // 🔒 PRICE RULE
    if (payload.allowVariants) {
      delete payload.mrp;
      delete payload.sellingPrice;
    } else {
      if (payload.mrp == null || payload.sellingPrice == null) {
        return res.status(400).json({
          message: "MRP and Selling Price required for non-variant product"
        });
      }

      if (Number(payload.sellingPrice) > Number(payload.mrp)) {
        return res.status(400).json({
          message: "Selling price cannot be greater than MRP"
        });
      }
    }

    const product = await createProductWithDefaultVariant(payload);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

/* ================= VARIANTS ================= */

export const getVariantsByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const variants = await Variant.find({ productId });
    res.json(variants);
  } catch (err) {
    next(err);
  }
};

export const createVariant = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { attributes, mrp, sellingPrice, defaultImage } = req.body;

    const variant = await Variant.create({
      productId,
      attributes,
      mrp,
      sellingPrice,
      defaultImage
    });

    const product = await Product.findById(productId);

    await Inventory.create({
      productId,
      variantId: variant._id,
      trackingType: product.trackingType,
      qty: 0,
      imeis: [],
      serials: []
    });

    res.status(201).json(variant);
  } catch (err) {
    next(err);
  }
};

export const updateVariantPrice = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const { mrp, sellingPrice } = req.body;

    const variant = await Variant.findByIdAndUpdate(
      variantId,
      {
        mrp: Number(mrp),
        sellingPrice: Number(sellingPrice)
      },
      { new: true }
    );

    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    res.json(variant);
  } catch (err) {
    next(err);
  }
};

export const deleteVariant = async (req, res, next) => {
  try {
    const { variantId } = req.params;

    await Variant.findByIdAndDelete(variantId);
    await Inventory.deleteOne({ variantId });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};


/* ================= UPDATE PRODUCT ================= */
export const updateProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const payload = { ...req.body };

    // 🔒 PRICE RULE (NON-VARIANT ONLY)
    if (!payload.allowVariants) {
      if (
        payload.mrp != null &&
        payload.sellingPrice != null &&
        Number(payload.sellingPrice) > Number(payload.mrp)
      ) {
        return res.status(400).json({
          message: "Selling price cannot be greater than MRP"
        });
      }
    } else {
      // variant product → price yahan save hi nahi hoga
      delete payload.mrp;
      delete payload.sellingPrice;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      payload,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (err) {
    next(err);
  }
};


import cloudinary from "../config/cloudinary.js";

/* ================= UPLOAD PRODUCT IMAGE ================= */
export const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image missing" });
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "products" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        )
        .end(req.file.buffer);
    });

    res.status(201).json({
      imageUrl: result.secure_url,
      cloudinaryPublicId: result.public_id
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId)
      .populate("categoryId")
      .populate("subCategoryId")
      .populate("childCategoryId")
      .populate("brandId")
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Get product by ID failed:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateVariant = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const { mrp, sellingPrice, images } = req.body;

    const variant = await Variant.findById(variantId);

    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    // ✅ PRICE UPDATE
    if (mrp !== undefined) variant.mrp = Number(mrp);
    if (sellingPrice !== undefined) variant.sellingPrice = Number(sellingPrice);

    // ✅ IMAGE SYNC (DELETE REMOVED FROM CLOUDINARY)
    if (Array.isArray(images)) {

      const removedImages = variant.images.filter(
        oldImg =>
          !images.some(
            newImg =>
              newImg.cloudinaryPublicId === oldImg.cloudinaryPublicId
          )
      );

      for (const img of removedImages) {
        if (img.cloudinaryPublicId) {
          await cloudinary.uploader.destroy(img.cloudinaryPublicId);
        }
      }

      variant.images = images;
    }

    await variant.save();

    res.json(variant);

  } catch (err) {
    console.error("UPDATE VARIANT ERROR:", err);
    next(err);
  }
};




