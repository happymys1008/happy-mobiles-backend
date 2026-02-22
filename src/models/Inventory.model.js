import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    skuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SKU",
      required: true,
      unique: true,   // 🔥 ONLY UNIQUE RULE
      index: true
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true
    },

    colorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductColor",
      default: null
    },

    trackingType: {
      type: String,
      enum: ["QTY", "SERIAL", "IMEI"],
      required: true
    },

    qty: {
      type: Number,
      default: 0,
      min: 0
    },

    imeis: {
      type: [String],
      default: []
    },

    serials: {
      type: [String],
      default: []
    },

    lowStockThreshold: {
      type: Number,
      default: 5
    },

    lowStock: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;