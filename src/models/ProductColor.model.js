import mongoose from "mongoose";

const productColorSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true
    },

    colorName: {
      type: String,
      required: true,
      trim: true
    },

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

// Prevent duplicate color per product
productColorSchema.index(
  { productId: 1, colorName: 1 },
  { unique: true }
);

const ProductColor = mongoose.model("ProductColor", productColorSchema);

export default ProductColor;
