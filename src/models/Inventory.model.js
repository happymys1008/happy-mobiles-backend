import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true
    },

    // ✅ Variant optional (non-variant products ke liye null)
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      default: null,
      index: true
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

/*
  ✅ UNIQUE RULE:
  - Non-variant product → (productId + null)
  - Variant product → (productId + variantId)
*/
inventorySchema.index(
  { productId: 1, variantId: 1 },
  { unique: true }
);

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;
