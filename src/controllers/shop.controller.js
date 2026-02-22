import Product from "../models/Product.model.js";
import Inventory from "../models/Inventory.model.js";
import Category from "../models/Category.model.js";
import SKU from "../models/SKU.model.js";
import ProductColor from "../models/ProductColor.model.js";

/**
 * SHOP PRODUCTS BY CATEGORY
 * SKU = Price Authority
 * Inventory = Stock Authority
 */
export const getShopProductsByCategory = async (req, res, next) => {
  try {
    const { categorySlug } = req.params;

    // 1️⃣ Category
    const category = await Category.findOne({ slug: categorySlug }).lean();
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // 2️⃣ Products (metadata only)
    const products = await Product.find({
      categoryId: category._id,
      isActive: true
    }).lean();

    if (!products.length) return res.json([]);

    const productIds = products.map(p => p._id);

    // 3️⃣ Fetch SKUs
    const skus = await SKU.find({
      productId: { $in: productIds }
    }).lean();

    // 4️⃣ Fetch Inventory
    const inventoryDocs = await Inventory.find({
      productId: { $in: productIds }
    }).lean();

    // 5️⃣ Fetch Colors
    const colors = await ProductColor.find({
      productId: { $in: productIds }
    }).lean();

    /* ================= AGGREGATION ================= */

    // 🔹 Stock aggregation
    const stockByProduct = {};
    for (const inv of inventoryDocs) {
      const key = String(inv.productId);
      stockByProduct[key] =
        (stockByProduct[key] || 0) + Number(inv.qty || 0);
    }

    // 🔹 Price aggregation (lowest price)
    const priceByProduct = {};
    for (const sku of skus) {
      const key = String(sku.productId);

      if (!priceByProduct[key]) {
        priceByProduct[key] = {
          minPrice: sku.sellingPrice,
          minMrp: sku.mrp
        };
      } else {
        priceByProduct[key].minPrice = Math.min(
          priceByProduct[key].minPrice,
          sku.sellingPrice
        );

        priceByProduct[key].minMrp = Math.min(
          priceByProduct[key].minMrp,
          sku.mrp
        );
      }
    }

    // 🔹 First image per product (from first color)
    const imageByProduct = {};
    for (const color of colors) {
      const key = String(color.productId);

      if (!imageByProduct[key] && color.images?.length) {
        imageByProduct[key] = color.images[0];
      }
    }

    /* ================= FINAL RESPONSE ================= */

    const result = products.map(p => {
      const key = String(p._id);

      const stockQty = stockByProduct[key] || 0;
      const priceInfo = priceByProduct[key] || {
        minPrice: 0,
        minMrp: 0
      };

      return {
        _id: p._id,
        name: p.name,
        slug: p.slug,
        brandId: p.brandId,
        trackingType: p.trackingType,

        price: priceInfo.minPrice,
        mrp: priceInfo.minMrp,

        image: imageByProduct[key] || null,

        stockQty,
        inStock: stockQty > 0
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};