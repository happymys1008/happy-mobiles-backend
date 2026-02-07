import Product from "../models/Product.model.js";
import Inventory from "../models/Inventory.model.js";
import Category from "../models/Category.model.js";

/**
 * SHOP PRODUCTS BY CATEGORY
 * Inventory = SINGLE SOURCE OF TRUTH
 */
export const getShopProductsByCategory = async (req, res, next) => {
  try {
    const { categorySlug } = req.params;

    // 1) Category
    const category = await Category.findOne({ slug: categorySlug }).lean();
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // 2) Products (metadata only)
    const products = await Product.find({
      categoryId: category._id,
      isActive: true
    }).lean();

    if (!products.length) return res.json([]);

    const productIds = products.map(p => p._id);

    // 3) Inventory (source of truth)
    const inventoryDocs = await Inventory.find({
      productId: { $in: productIds }
    }).lean();

    // 4) Aggregate stock by product
    const stockByProduct = {};
    for (const inv of inventoryDocs) {
      const key = String(inv.productId);
      stockByProduct[key] = (stockByProduct[key] || 0) + Number(inv.qty || 0);
    }

    // 5) Shape response for shop (FAST & SIMPLE)
    const result = products.map(p => {
      const stockQty = stockByProduct[String(p._id)] || 0;
      return {
        _id: p._id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        mrp: p.mrp,
        images: p.images,
        brandId: p.brandId,
        trackingType: p.trackingType,
        stockQty,
        inStock: stockQty > 0
      };
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};
