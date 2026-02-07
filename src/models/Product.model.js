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
      ref: "SubCategory"
    },

    childCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChildCategory"
    },

    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand"
    },

    trackingType: {
      type: String,
      enum: ["QTY", "SERIAL", "IMEI"],
      default: "QTY"
    },

    // 🔥 DECISION POINT (CREATE TIME ONLY)
    allowVariants: {
      type: Boolean,
      default: false
    },

    // 🔒 PRODUCT LEVEL PRICE (ONLY FOR NON-VARIANT)
    mrp: {
      type: Number,
      default: null
    },

    sellingPrice: {
      type: Number,
      default: null
    },

    images: [{ type: String }],

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

/* =====================================================
   🔒 HARD BUSINESS RULE (CREATE + UPDATE BOTH)
===================================================== */

// CREATE / SAVE
productSchema.pre("save", function (next) {
  if (this.allowVariants) {
    // ❌ Variant product → product price NOT allowed
    this.mrp = null;
    this.sellingPrice = null;
  } else {
    // ✅ Non-variant product → price REQUIRED
    if (this.mrp == null || this.sellingPrice == null) {
      return next(
        new Error("MRP and Selling Price are required for non-variant product")
      );
    }

    if (this.sellingPrice > this.mrp) {
      return next(
        new Error("Selling price cannot be greater than MRP")
      );
    }
  }

  next();
});

// UPDATE
productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (!update) return next();

  // Variant ON → price auto remove
  if (update.allowVariants === true) {
    update.mrp = null;
    update.sellingPrice = null;
  }

  // Variant OFF → price validate
  if (update.allowVariants === false) {
    if (update.mrp == null || update.sellingPrice == null) {
      return next(
        new Error("MRP and Selling Price are required for non-variant product")
      );
    }

    if (Number(update.sellingPrice) > Number(update.mrp)) {
      return next(
        new Error("Selling price cannot be greater than MRP")
      );
    }
  }

  this.setUpdate(update);
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
