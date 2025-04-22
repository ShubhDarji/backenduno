import express from "express";
import {
  createReview,
  handleReviewUpload,
  getReviewsByProduct,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:productId", protect, handleReviewUpload, createReview);
router.get("/:productId", getReviewsByProduct);

export default router;