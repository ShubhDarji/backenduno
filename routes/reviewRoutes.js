import express from "express";
import { protect, protectSeller, protectAdmin } from "../middleware/authMiddleware.js";
import {
  addReview,
  updateReview,
  deleteReview,
  getProductReviews,
  getSellerReviews,
  adminDeleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();

// ✅ Add Review
router.post("/add", protect, addReview);

// ✅ Update Review
router.put("/update/:id", protect, updateReview);

// ✅ Delete Review
router.delete("/delete/:id", protect, deleteReview);

// ✅ Get Product Reviews
router.get("/product/:productId", getProductReviews);

// ✅ Get Reviews for Seller's Products
router.get("/seller", protectSeller, getSellerReviews);

// ✅ Admin Delete Review
router.delete("/admin/delete/:id", protectAdmin, adminDeleteReview);

export default router;
