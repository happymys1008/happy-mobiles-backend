import Variant from "../models/Variant.model.js";

/* ================= GET VARIANTS BY PRODUCT ================= */
export const getVariantsByProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const variants = await Variant.find({ productId })
      .sort({ createdAt: 1 });

    res.json(variants);
  } catch (err) {
    next(err);
  }
};


/* ================= UPDATE VARIANT ================= */
export const updateVariant = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const { mrp, sellingPrice, images, attributes } = req.body;

    const updateData = {};

    if (mrp !== undefined) {
      updateData.mrp = Number(mrp);
    }

    if (sellingPrice !== undefined) {
      updateData.sellingPrice = Number(sellingPrice);
    }

    if (attributes && typeof attributes === "object") {
      updateData.attributes = attributes;
    }

    if (Array.isArray(images)) {
      updateData.images = images;
    }

    const updated = await Variant.findByIdAndUpdate(
      variantId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Variant not found" });
    }

    res.json(updated);

  } catch (err) {
    console.error("UPDATE VARIANT ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

