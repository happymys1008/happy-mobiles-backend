import express from "express";
import auth from "../middlewares/auth.middleware.js";
import role from "../middlewares/role.middleware.js";

import {
  createReviewController,
  getProductReviewsController,
  getAllReviewsController,
  updateReviewStatusController,
  deleteReviewController,
} from "../controllers/review.controller.js";

const router = express.Router();

/* =========================================================
   ADMIN ROUTES (STATIC FIRST)
========================================================= */

// Get all reviews (admin dashboard)
router.get("/", auth, role("admin"), getAllReviewsController);

// Approve / Reject review
router.patch("/:id", auth, role("admin"), updateReviewStatusController);

// Delete review
router.delete("/:id", auth, role("admin"), deleteReviewController);


/* =========================================================
   CUSTOMER ROUTE
========================================================= */

// Create review (only logged-in user)
router.post("/:productId", auth, createReviewController);


/* =========================================================
   PUBLIC ROUTE (KEEP LAST)
========================================================= */

// Get approved reviews for product
router.get("/:productId", getProductReviewsController);

export default router;
