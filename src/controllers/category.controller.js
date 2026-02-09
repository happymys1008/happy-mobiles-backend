import Category from "../models/Category.model.js";
import SubCategory from "../models/SubCategory.model.js";
import ChildCategory from "../models/ChildCategory.model.js";
import { clearCache } from "../utils/appCache.js";

/* ================= CATEGORY ================= */

export const getCategories = async (req, res, next) => {
  try {
    // ✅ Treat all categories as ACTIVE by default
    const list = await Category.find().sort({ order: 1 });
    res.json(list);
  } catch (e) {
    next(e);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      // ✅ FORCE ACTIVE = true (Admin UI ke hisaab se)
      active: true
    };

    const item = await Category.create(payload);

    /* 🧹 CLEAR BOOTSTRAP CACHE */
    clearCache("app:bootstrap");

    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
};

/* ================= SUB CATEGORY ================= */

export const getSubCategories = async (req, res, next) => {
  try {
    const list = await SubCategory.find().sort({ order: 1 });
    res.json(list);
  } catch (e) {
    next(e);
  }
};

export const createSubCategory = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      active: true
    };

    const item = await SubCategory.create(payload);

    /* 🧹 CLEAR BOOTSTRAP CACHE */
    clearCache("app:bootstrap");

    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
};

/* ================= CHILD CATEGORY ================= */

export const getChildCategories = async (req, res, next) => {
  try {
    const list = await ChildCategory.find().sort({ order: 1 });
    res.json(list);
  } catch (e) {
    next(e);
  }
};

export const createChildCategory = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      active: true
    };

    const item = await ChildCategory.create(payload);

    /* 🧹 CLEAR BOOTSTRAP CACHE */
    clearCache("app:bootstrap");

    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
};
