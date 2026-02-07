import Variant from "../models/Variant.model.js";

export const updateVariant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { mrp, sellingPrice } = req.body;

    const variant = await Variant.findByIdAndUpdate(
      id,
      {
        mrp: Number(mrp),
        sellingPrice: Number(sellingPrice)
      },
      { new: true }
    );

    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    res.json(variant);
  } catch (err) {
    next(err);
  }
};
