import Product from "../models/Product.model.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/* ================= LIST PRODUCTS ================= */
/*
  - Always return EXECUTED data (array)
  - Never return mongoose Query object
  - Admin product list depends on this
*/
export const listProducts = async ({ page, limit } = {}) => {
  const safeLimit = Math.min(limit || DEFAULT_LIMIT, MAX_LIMIT);
  const safePage = page || 1;
  const skip = (safePage - 1) * safeLimit;

  const products = await Product.find()
    .skip(skip)
    .limit(safeLimit)
    .lean(); // 🚀 fast + clean plain objects

  return products;
};

/* ================= CREATE PRODUCT ================= */
/*
  RULES (FINAL):
  - Admin decides allowVariants
  - Product create = catalog only
  - ❌ NO inventory on product create
  - ❌ NO variant on product create
  - ✅ Inventory comes ONLY from PURCHASE
  - ✅ Variants added later by Admin
*/
export const createProductWithDefaultVariant = async (data) => {
  const {
    name,
    slug,
    categoryId,
    subCategoryId,
    childCategoryId,
    brandId,
    trackingType,
    allowVariants,
    mrp,
    sellingPrice
  } = data;

  /* 🔒 EMPTY STRING → NULL (Mongo ObjectId safety) */
  const cleanSubCategoryId =
    subCategoryId && subCategoryId !== "" ? subCategoryId : null;

  const cleanChildCategoryId =
    childCategoryId && childCategoryId !== "" ? childCategoryId : null;

  const cleanBrandId =
    brandId && brandId !== "" ? brandId : null;

  /* ================= CREATE PRODUCT ================= */
  const product = await Product.create({
    name,
    slug,
    categoryId,
    subCategoryId: cleanSubCategoryId,
    childCategoryId: cleanChildCategoryId,
    brandId: cleanBrandId,
    trackingType,
    allowVariants,
    mrp: allowVariants ? null : mrp,
    sellingPrice: allowVariants ? null : sellingPrice
  });

  // ❌ NO INVENTORY HERE
  // ❌ NO VARIANT HERE
  // ✅ Inventory will be created from PURCHASE
  // ✅ Variants will be added later by Admin

  return product;
};
