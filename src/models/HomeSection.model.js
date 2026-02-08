import mongoose from "mongoose";

const HomeSectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    limit: {
      type: Number,
      default: 8
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

const HomeSection = mongoose.model(
  "HomeSection",
  HomeSectionSchema
);

export default HomeSection;
