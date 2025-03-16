import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Seller from "../models/Seller.js";

// ✅ Add a Review
export const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingReview = await Review.findOne({
      customerId: req.user._id,
      productId,
    });

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    const newReview = new Review({
      customerId: req.user._id,
      productId,
      rating,
      comment,
      sellerId: product.sellerId,
    });

    await newReview.save();
    res.status(201).json({ message: "Review added successfully", review: newReview });
  } catch (error) {
    res.status(500).json({ message: "Error adding review" });
  }
};

// ✅ Update a Review
export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized: You can only update your own reviews" });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    res.json({ message: "Review updated successfully", review });
  } catch (error) {
    res.status(500).json({ message: "Error updating review" });
  }
};

// ✅ Delete a Review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized: You can only delete your own reviews" });
    }

    await review.deleteOne();
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review" });
  }
};

// ✅ Get Reviews for a Product
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).populate("customerId", "name");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews" });
  }
};

// ✅ Get Reviews for Seller's Products
export const getSellerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ sellerId: req.seller._id }).populate("productId customerId");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching seller reviews" });
  }
};

// ✅ Admin Delete a Review
export const adminDeleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    await review.deleteOne();
    res.json({ message: "Review deleted by admin successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review" });
  }
};
