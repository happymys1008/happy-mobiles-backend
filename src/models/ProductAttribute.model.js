import mongoose from "mongoose";

const productAttributeSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true // ram, storage, color
    },
    name: {
      type: String,
      required: true // RAM, STORAGE, COLOR
    },
    values: {
      type: [String],
      default: []
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model(
  "ProductAttribute",
  productAttributeSchema
);
