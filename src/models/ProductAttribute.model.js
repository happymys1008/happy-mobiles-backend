import mongoose from "mongoose";

const ProductAttributeSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true // ram, storage, color
    },
    name: {
      type: String,
      required: true // RAM, STORAGE
    },
    values: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

export default mongoose.model("ProductAttribute", ProductAttributeSchema);
