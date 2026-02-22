import Product from "../models/Product.model.js";
import SKU from "../models/SKU.model.js";
import Inventory from "../models/Inventory.model.js";
import ProductColor from "../models/ProductColor.model.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/* ================= LIST PRODUCTS ================= */
export const listProducts = async ({ page, limit } = {}) => {
  const safeLimit = Math.min(limit || DEFAULT_LIMIT, MAX_LIMIT);
  const safePage = page || 1;
  const skip = (safePage - 1) * safeLimit;

  const total = await Product.countDocuments({ isActive: true });

  const baseProducts = await Product.find({ isActive: true })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(safeLimit)
    .lean();

  const productIds = baseProducts.map(p => p._id);

  /* ================= FETCH SKUS ================= */
  const skus = await SKU.find({
    productId: { $in: productIds }
  }).lean();

/* ================= FETCH COLORS ================= */
const colors = await ProductColor.find({
  productId: { $in: productIds }
}).lean();

  /* ================= FETCH INVENTORY ================= */
  const inventoryDocs = await Inventory.find({
    productId: { $in: productIds }
  }).lean();

  const stockBySku = {};
  for (const inv of inventoryDocs) {
    if (inv.skuId) {
      stockBySku[String(inv.skuId)] = Number(inv.qty || 0);
    }
  }

  /* ================= BUILD FINAL PRODUCTS ================= */
  const products = baseProducts.map(product => {
    const productSkus = skus.filter(
      s => String(s.productId) === String(product._id)
    );

const enriched = productSkus.map(sku => {
  const stockQty = stockBySku[String(sku._id)] || 0;

  // 🔥 Convert Map to normal object
  const attrObject =
    sku.attributes instanceof Map
      ? Object.fromEntries(sku.attributes)
      : sku.attributes || {};

  return {
    skuId: sku._id,
    price: sku.sellingPrice,
    mrp: sku.mrp,
    colorId: sku.colorId || null,
    inStock: stockQty > 0,
    attributes: attrObject   // 🔥 THIS IS THE FIX
  };
});

    const inStockSkus = enriched.filter(s => s.inStock);
    const target = inStockSkus.length ? inStockSkus : enriched;

    let displayPrice = null;
    let displayMrp = null;
    let stockState = "COMING";

    if (target.length) {
      const sorted = [...target].sort(
        (a, b) => (a.price || 0) - (b.price || 0)
      );

      displayPrice = sorted[0].price ?? null;
      displayMrp = sorted[0].mrp ?? null;
      stockState = inStockSkus.length ? "AVAILABLE" : "OUT";
    }

const productColors = colors.filter(
  c => String(c.productId) === String(product._id)
);

let thumbnail = null;

if (productColors.length) {
  const firstColorWithImage = productColors.find(
    c => c.images && c.images.length
  );

  if (firstColorWithImage) {
    thumbnail = firstColorWithImage.images[0];
  }
}

return {
  ...product,
  skus: enriched,   // 🔥 IMPORTANT
  displayPrice,
  mrp:
    displayMrp && displayMrp > displayPrice
      ? displayMrp
      : displayPrice,
  stockState,
  thumbnail
};
  });

  const totalPages = Math.ceil(total / safeLimit);

  return {
    data: products,
    page: safePage,
    limit: safeLimit,
    total,
    totalPages
  };
};

/* ================= CREATE PRODUCT ================= */
/*
  NEW ARCHITECTURE:
  - Product metadata create hoga
  - hasVariants = false → auto default SKU
  - Inventory always SKU-based
*/
export const createProduct = async (data) => {
const {
  name,
  slug,
  categoryId,
  subCategoryId,
  childCategoryId,
  brandId,
  trackingType,
  hasVariants,
  variantConfig = []
} = data;

  const cleanSubCategoryId =
    subCategoryId && subCategoryId !== "" ? subCategoryId : null;

  const cleanChildCategoryId =
    childCategoryId && childCategoryId !== "" ? childCategoryId : null;

  const cleanBrandId =
    brandId && brandId !== "" ? brandId : null;

const product = await Product.create({
  name,
  slug,
  categoryId,
  subCategoryId: cleanSubCategoryId,
  childCategoryId: cleanChildCategoryId,
  brandId: cleanBrandId,
  trackingType,
  hasVariants: !!hasVariants,
  variantConfig: hasVariants ? variantConfig : []
});

  /* ===============================
     AUTO DEFAULT SKU (NON-VARIANT)
  =============================== */
if (!product.hasVariants) {
  try {
    const defaultSku = await SKU.create({
      productId: product._id,
      colorId: null,
      ram: "DEFAULT",
      storage: "DEFAULT",
      mrp: 0,
      sellingPrice: 0
    });

    await Inventory.findOneAndUpdate(
      { skuId: defaultSku._id },
      {
        $setOnInsert: {
          productId: product._id,
          colorId: null,
          trackingType: product.trackingType || "QTY",
          qty: 0,
          imeis: [],
          serials: []
        }
      },
      { upsert: true, new: true }
    );

  } catch (err) {
    console.error("🔥 AUTO SKU BLOCK ERROR:", err);
  }
}

  return product;
};