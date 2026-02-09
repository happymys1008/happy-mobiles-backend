import ChildCategory from "../models/ChildCategory.model.js";

/* ================= GET ALL CHILD CATEGORIES ================= */
export const getAllChildCategories = async (req, res, next) => {
  try {
    const list = await ChildCategory.find()
      .sort({ order: 1 })
      .lean();

    res.json(list);
  } catch (err) {
    next(err);
  }
};
