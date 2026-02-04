import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: String,
    price: Number,
    mrp: Number,
    images: [String],
    isAvailable: Boolean
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;   // ✅ DEFAULT EXPORT