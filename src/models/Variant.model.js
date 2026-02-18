import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true
    },

    attributes: {
      type: Object,
      required: true
    },

    mrp: {
      type: Number,
      required: true
    },

    sellingPrice: {
      type: Number,
      required: true
    },

    // 🔥 MULTIPLE IMAGES PER VARIANT
    images: [
      {
        imageUrl: {
          type: String,
          required: true
        },
        cloudinaryPublicId: {
          type: String,
          required: true
        }
      }
    ]

  },
  { timestamps: true }
);

// 🔥 Prevent duplicate attribute combinations
variantSchema.index(
  { productId: 1, attributes: 1 },
  { unique: true }
);

const Variant = mongoose.model("Variant", variantSchema);

export default Variant;
