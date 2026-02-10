import Variant from "../models/Variant.model.js";

/* ================= GET VARIANTS BY PRODUCT ================= */
export const getVariantsByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const variants = await Variant.find({ productId }).sort({
      createdAt: 1
    });

    res.json(variants);
  } catch (err) {
    next(err);
  }
};

/* ================= UPDATE VARIANT ================= */
export const updateVariant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { mrp, sellingPrice, defaultImage } = req.body;

    const variant = await Variant.findByIdAndUpdate(
      id,
      {
        ...(mrp !== undefined && { mrp: Number(mrp) }),
        ...(sellingPrice !== undefined && {
          sellingPrice: Number(sellingPrice)
        }),
        ...(defaultImage !== undefined && { defaultImage })
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
