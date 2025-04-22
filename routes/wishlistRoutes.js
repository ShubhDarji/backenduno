import express from "express";
import {
  toggleWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, toggleWishlist);
router.get("/", protect, getWishlist);
router.delete("/:productId", protect, removeFromWishlist); // NEW

export default router;