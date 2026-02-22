import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    slug: { type: String, unique: true },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      default: null
    },

    childCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChildCategory",
      default: null
    },

    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      default: null
    },

    trackingType: {
      type: String,
      enum: ["QTY", "SERIAL", "IMEI"],
      default: "QTY"
    },

    /* ✅ NEW FIELD */
    hasVariants: {
      type: Boolean,
      default: false
    },

// 🔥 NEW PROFESSIONAL FIELD
variantConfig: {
  type: [String],
  enum: ["COLOR", "RAM", "STORAGE"],
  default: []
},

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */

productSchema.index({ name: "text" });
productSchema.index({ categoryId: 1 });
productSchema.index({ subCategoryId: 1 });
productSchema.index({ childCategoryId: 1 });
productSchema.index({ brandId: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model("Product", productSchema);
export default Product;