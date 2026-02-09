import HomeSection from "../models/HomeSection.model.js";
import { clearCache } from "../utils/appCache.js";

/* ================= GET ALL ================= */
export const getAll = async (req, res, next) => {
  try {
    const sections = await HomeSection.find()
      .sort({ order: 1 })
      .lean();

    res.json(sections);
  } catch (err) {
    next(err);
  }
};

/* ================= CREATE ================= */
export const create = async (req, res, next) => {
  try {
    const section = await HomeSection.create(req.body);

    /* 🧹 CLEAR BOOTSTRAP CACHE */
    clearCache("app:bootstrap");

    res.status(201).json(section);
  } catch (err) {
    next(err);
  }
};

/* ================= UPDATE ================= */
export const update = async (req, res, next) => {
  try {
    const section = await HomeSection.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    /* 🧹 CLEAR BOOTSTRAP CACHE */
    clearCache("app:bootstrap");

    res.json(section);
  } catch (err) {
    next(err);
  }
};

/* ================= DELETE ================= */
export const remove = async (req, res, next) => {
  try {
    await HomeSection.findByIdAndDelete(req.params.id);

    /* 🧹 CLEAR BOOTSTRAP CACHE */
    clearCache("app:bootstrap");

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
