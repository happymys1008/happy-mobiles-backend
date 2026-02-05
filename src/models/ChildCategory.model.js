import mongoose from "mongoose";

const childCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("ChildCategory", childCategorySchema);