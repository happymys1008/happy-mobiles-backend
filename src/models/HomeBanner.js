import mongoose from "mongoose";

const homeBannerSchema = new mongoose.Schema(
  {
    title: String,
    imageUrl: { type: String, required: true },
    blurImageUrl: String,
    order: { type: Number, default: 1 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("HomeBanner", homeBannerSchema);
