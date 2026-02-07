import mongoose from "mongoose";

const PurchaseItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      default: null
    },
    qty: {
      type: Number,
      required: true,
      min: 1
    },
    costPrice: {
      type: Number,
      required: true
    },
    imeis: {
      type: [String],
      default: []
    }
  },
  { _id: false }
);

const PurchaseSchema = new mongoose.Schema(
  {
    invoiceNo: {
      type: String,
      trim: true
    },
    supplierId: {
      type: String,
      required: true
    },
    invoiceDate: {
      type: Date,
      required: true
    },
    items: {
      type: [PurchaseItemSchema],
      required: true
    },
    status: {
      type: String,
      enum: ["ACTIVE", "CANCELLED"],
      default: "ACTIVE"
    },

    // ✅ DEV MODE SAFE (auth disabled)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Purchase", PurchaseSchema);
