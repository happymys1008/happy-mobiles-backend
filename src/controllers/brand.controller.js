import Brand from "../models/Brand.model.js";

/* GET all brands */
export const getBrands = async (req, res, next) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json(brands);
  } catch (err) {
    next(err);
  }
};

/* CREATE brand */
export const createBrand = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: "Name required" });

    const exists = await Brand.findOne({ name });
    if (exists)
      return res.status(400).json({ message: "Brand already exists" });

    const brand = await Brand.create({ name });

    res.status(201).json(brand);
  } catch (err) {
    next(err);
  }
};