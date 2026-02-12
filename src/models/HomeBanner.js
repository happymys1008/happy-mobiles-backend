import mongoose from "mongoose";

const homeBannerSchema = new mongoose.Schema(
  {
    title: { 
      type: String 
    },

    imageUrl: {
      type: String,
      required: true
    },

    // 🔥 REQUIRED FOR IMAGEKIT DELETE
    imagekitFileId: {
      type: String,
      required: true
    },

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
