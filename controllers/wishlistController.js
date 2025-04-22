import asyncHandler from "express-async-handler";
import Wishlist from "../models/Wishlist.js";

// Toggle Wishlist (Add or Remove)
export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  const existing = await Wishlist.findOne({ userId, productId });

  if (existing) {
    await existing.deleteOne();
    return res.status(200).json({ message: "Removed from wishlist", wished: false });
  }

  await Wishlist.create({ userId, productId });
  res.status(201).json({ message: "Added to wishlist", wished: true });
});

// Get Wishlist Items for User
export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.find({ userId: req.user._id }).populate("productId");
  res.status(200).json(wishlist);
});

// NEW: Remove from Wishlist by productId
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  const deleted = await Wishlist.findOneAndDelete({ userId, productId });

  if (!deleted) {
    return res.status(404).json({ message: "Item not found in wishlist." });
  }

  res.status(200).json({ message: "Item removed from wishlist" });
});