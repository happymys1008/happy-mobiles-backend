import ChildCategory from "../models/ChildCategory.model.js";

export const getAllChildCategories = async (req, res, next) => {
  try {
    const list = await ChildCategory.find().lean();
    res.json(list);
  } catch (err) {
    next(err);
  }
};
