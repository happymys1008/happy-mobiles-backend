import Review from "../models/Review.model.js";
import Order from "../models/Order.model.js";
import mongoose from "mongoose";

/* =========================================================
   CREATE REVIEW (ONLY IF PRODUCT DELIVERED)
========================================================= */
export const createReview = async ({ productId, userId, rating, comment }) => {
  const productObjectId = new mongoose.Types.ObjectId(productId);

  // 🔎 Check if delivered order exists
  const deliveredOrder = await Order.findOne({
    user: userId,
    status: "DELIVERED",
    "items.product": productObjectId,
  });

  if (!deliveredOrder) {
    throw new Error("You can only review delivered products");
  }

  // 🚫 Prevent duplicate review
  const existing = await Review.findOne({
    product: productObjectId,
    user: userId,
  });

  if (existing) {
    throw new Error("You already reviewed this product");
  }

  const review = await Review.create({
    product: productObjectId,
    user: userId,
    order: deliveredOrder._id,
    rating,
    comment,
    status: "APPROVED", // 🔥 can switch to PENDING later if needed
  });

  return review;
};


/* =========================================================
   GET APPROVED REVIEWS BY PRODUCT
========================================================= */
export const getReviewsByProduct = async (productId) => {
  const productObjectId = new mongoose.Types.ObjectId(productId);

  return Review.find({
    product: productObjectId,
    status: "APPROVED",
  })
    .populate("user", "name")
    .sort({ createdAt: -1 });
};


/* =========================================================
   GET PRODUCT AVERAGE RATING
========================================================= */
export const getAverageRating = async (productId) => {
  const productObjectId = new mongoose.Types.ObjectId(productId);

  const result = await Review.aggregate([
    {
      $match: {
        product: productObjectId,
        status: "APPROVED",
      },
    },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (!result.length) {
    return { avg: 0, total: 0 };
  }

  return {
    avg: Number(result[0].avgRating.toFixed(1)),
    total: result[0].totalReviews,
  };
};


/* =========================================================
   GET ALL REVIEWS (ADMIN)
========================================================= */
export const getAllReviews = async () => {
  return Review.find()
    .populate("product", "name")
    .populate("user", "name mobile")
    .sort({ createdAt: -1 });
};


/* =========================================================
   UPDATE REVIEW STATUS (ADMIN)
========================================================= */
export const updateReviewStatus = async (reviewId, status) => {
  return Review.findByIdAndUpdate(
    reviewId,
    { status },
    { new: true }
  );
};


/* =========================================================
   DELETE REVIEW (ADMIN)
========================================================= */
export const deleteReview = async (reviewId) => {
  return Review.findByIdAndDelete(reviewId);
};


