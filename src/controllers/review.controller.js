import {
  createReview,
  getReviewsByProduct,
  getAverageRating,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
} from "../services/review.service.js";


/* =========================================================
   CREATE REVIEW
========================================================= */
export const createReviewController = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId;
    const userId = req.user._id; // 🔥 from upgraded auth middleware

    const review = await createReview({
      productId,
      userId,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

/* =========================================================
   GET PRODUCT REVIEWS
========================================================= */
export const getProductReviewsController = async (req, res, next) => {
  try {
    const productId = req.params.productId;

    const reviews = await getReviewsByProduct(productId);
    const ratingData = await getAverageRating(productId);

    res.json({
      reviews,
      averageRating: ratingData.avg,
      totalReviews: ratingData.total,
    });
  } catch (err) {
    next(err);
  }
};



/* =========================================================
   GET ALL REVIEWS (ADMIN)
========================================================= */
export const getAllReviewsController = async (req, res, next) => {
  try {
    const reviews = await getAllReviews();
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};


/* =========================================================
   UPDATE REVIEW STATUS (ADMIN)
========================================================= */
export const updateReviewStatusController = async (req, res, next) => {
  try {
    const { status } = req.body;

    const review = await updateReviewStatus(req.params.id, status);

    res.json(review);
  } catch (err) {
    next(err);
  }
};


/* =========================================================
   DELETE REVIEW (ADMIN)
========================================================= */
export const deleteReviewController = async (req, res, next) => {
  try {
    await deleteReview(req.params.id);
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    next(err);
  }
};

