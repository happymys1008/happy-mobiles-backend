import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    slug: { type: String, unique: true },

    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },

    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" },

    childCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "ChildCategory" },

    brandId: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },

    trackingType: {
      type: String,
      enum: ["QTY", "SERIAL", "IMEI"],
      default: "QTY"
    },

    allowVariants: { type: Boolean, default: false },

    mrp: { type: Number, default: null },

    sellingPrice: { type: Number, default: null },

    images: [{ type: String }],

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;