import mongoose from "mongoose";

const homeBannerSchema = new mongoose.Schema(
  {
    title: { type: String },

    imageUrl: {
      type: String,
      required: true
    },

    // ✅ REQUIRED FOR CLOUDINARY DELETE
    cloudinaryPublicId: {
      type: String,
      required: true
    },

    blurImageUrl: { type: String },

    order: {
      type: Number,
      default: 1
    },

    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("HomeBanner", homeBannerSchema);
