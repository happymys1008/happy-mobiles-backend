import SubCategory from "../models/SubCategory.model.js";

/* ================= GET ALL SUB CATEGORIES ================= */
export const getAllSubCategories = async (req, res, next) => {
  try {
    const list = await SubCategory.find()
      .sort({ order: 1 })
      .lean();

    res.json(list);
  } catch (err) {
    next(err);
  }
};
