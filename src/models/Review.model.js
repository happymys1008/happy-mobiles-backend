import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    comment: {
      type: String,
      trim: true,
      required: true
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true
    }
  },
  { timestamps: true }
);

/* =========================================================
   Prevent duplicate review per user per product
========================================================= */
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

/* =========================================================
   Performance index (very important)
========================================================= */
reviewSchema.index({ product: 1, status: 1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
