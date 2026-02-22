import Category from "../models/Category.model.js";
import SubCategory from "../models/SubCategory.model.js";
import ChildCategory from "../models/ChildCategory.model.js";
import Brand from "../models/Brand.model.js";
import Product from "../models/Product.model.js";
import Inventory from "../models/Inventory.model.js";
import ProductAttribute from "../models/ProductAttribute.model.js";
import HomeBanner from "../models/HomeBanner.js";
import HomeSection from "../models/HomeSection.model.js";
import SKU from "../models/SKU.model.js";

import { getCache, setCache } from "../utils/appCache.js";

/* ================= CACHE CONFIG ================= */
const BOOTSTRAP_CACHE_KEY = "app:bootstrap";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const getAppBootstrap = async (req, res, next) => {
  try {
    /* 1️⃣ CACHE */
    const cached = getCache(BOOTSTRAP_CACHE_KEY);
    if (cached) return res.json(cached);

    /* 2️⃣ FETCH DATA */
    const [
      categories,
      subCategories,
      childCategories,
      brands,
      attributes,
      homeBanners,
      homeSections,
      products,
      skus,
      inventory
    ] = await Promise.all([
      Category.find().sort({ order: 1 }).lean(),
      SubCategory.find().sort({ order: 1 }).lean(),
      ChildCategory.find().sort({ order: 1 }).lean(),
      Brand.find().sort({ name: 1 }).lean(),
      ProductAttribute.find().sort({ order: 1 }).lean(),
      HomeBanner.find({}).sort({ order: 1 }).lean(),
      HomeSection.find({}).sort({ order: 1 }).lean(),
      Product.find({ active: true }).lean(),
      SKU.find().lean(),
      Inventory.find().lean()
    ]);

    /* 3️⃣ ATTACH SKUS TO PRODUCTS */
    const productsWithSkus = products.map(product => ({
      ...product,
      skus: skus.filter(
        sku => String(sku.productId) === String(product._id)
      )
    }));

    const payload = {
      categories,
      subCategories,
      childCategories,
      brands,
      attributes,
      homeBanners,
      homeSections,
      products: productsWithSkus,
      inventory
    };

    /* 4️⃣ CACHE */
    setCache(BOOTSTRAP_CACHE_KEY, payload, CACHE_TTL);

    res.json(payload);
  } catch (err) {
    next(err);
  }
};