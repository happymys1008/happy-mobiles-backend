import Product from "../models/Product.model.js";
import SKU from "../models/SKU.model.js";
import ProductColor from "../models/ProductColor.model.js";
import Inventory from "../models/Inventory.model.js";
import {
  listProducts,
  createProduct as createProductService
} from "../services/product.service.js";

import cloudinary from "../config/cloudinary.js";

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

/* ================= CREATE PRODUCT ================= */

export const createProduct = async (req, res, next) => {
  try {
    const payload = { ...req.body };

    const product = await createProductService(payload);

    // 🔥 AUTO CREATE DEFAULT SKU ONLY FOR NON-VARIANT PRODUCT
    if (!product.hasVariants) {
await SKU.create({
  productId: product._id,
  colorId: null,
  attributes: {},
  mrp: payload.mrp || 0,
  sellingPrice: payload.sellingPrice || 0,
  skuCode: `${product.slug}-STD`
});
    }

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });

  } catch (err) {
    next(err);
  }
};

/* ================= UPDATE PRODUCT ================= */

export const updateProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const payload = { ...req.body };

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

/* ================= UPLOAD PRODUCT IMAGE ================= */
/*
  ⚠️ NOTE:
  Product-level images should ideally be removed.
  Colors should manage images.
  Keep this only if admin UI still depends on it temporarily.
*/

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

/* ================= GET PRODUCT BY ID (SKU AWARE) ================= */

export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1️⃣ Product metadata
    const product = await Product.findById(productId)
      .populate("categoryId")
      .populate("subCategoryId")
      .populate("childCategoryId")
      .populate("brandId")
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 2️⃣ Fetch Colors
    const colors = await ProductColor.find({ productId }).lean();

    // 3️⃣ Fetch SKUs
    const skus = await SKU.find({ productId }).lean();

    // 4️⃣ Fetch Inventory
    const inventoryDocs = await Inventory.find({ productId }).lean();

// 🔹 Inventory map
const stockBySku = {};
for (const inv of inventoryDocs) {
  if (inv.skuId) {
    stockBySku[String(inv.skuId)] = Number(inv.qty || 0);
  }
}

// 🔹 Group SKUs by color
const skusByColor = {};
for (const sku of skus) {
  const key = String(sku.colorId);
  if (!skusByColor[key]) skusByColor[key] = [];
  skusByColor[key].push(sku);
}

// 🔹 Attach SKUs under color
const colorsWithSkus = colors.map(color => {
const colorSkus = (skusByColor[String(color._id)] || []).map(sku => {
  const stockQty = stockBySku[String(sku._id)] || 0;

  return {
    _id: sku._id,
    attributes: sku.attributes || {},
    price: sku.sellingPrice,
    mrp: sku.mrp,
    stockQty,
    inStock: stockQty > 0
  };
});

  return {
    _id: color._id,
    colorName: color.colorName,
    images: color.images || [],
    skus: colorSkus
  };
});

    res.json({
      ...product,
      colors: colorsWithSkus
    });

  } catch (error) {
    console.error("Get product by ID failed:", error);
    res.status(500).json({ message: "Server error" });
  }
};