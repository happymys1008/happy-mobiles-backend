import SubCategory from "../models/SubCategory.model.js";

export const getAllSubCategories = async (req, res, next) => {
  try {
    const list = await SubCategory.find().lean();
    res.json(list);
  } catch (err) {
    next(err);
  }
};
