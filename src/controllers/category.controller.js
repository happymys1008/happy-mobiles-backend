import Category from "../models/Category.model.js";
import SubCategory from "../models/SubCategory.model.js";
import ChildCategory from "../models/ChildCategory.model.js";

/* CATEGORY */

export const getCategories = async (req, res, next) => {
  try {
    res.json(await Category.find().sort({ name: 1 }));
  } catch (e) { next(e); }
};

export const createCategory = async (req, res, next) => {
  try {
    const item = await Category.create(req.body);
    res.status(201).json(item);
  } catch (e) { next(e); }
};

/* SUB */

export const getSubCategories = async (req, res, next) => {
  try {
    res.json(await SubCategory.find());
  } catch (e) { next(e); }
};

export const createSubCategory = async (req, res, next) => {
  try {
    const item = await SubCategory.create(req.body);
    res.status(201).json(item);
  } catch (e) { next(e); }
};

/* CHILD */

export const getChildCategories = async (req, res, next) => {
  try {
    res.json(await ChildCategory.find());
  } catch (e) { next(e); }
};

export const createChildCategory = async (req, res, next) => {
  try {
    const item = await ChildCategory.create(req.body);
    res.status(201).json(item);
  } catch (e) { next(e); }
};