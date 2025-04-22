import asyncHandler from "express-async-handler";
import multer from "multer";
import path from "path";
import fs from "fs";
import Review from "../models/Review.js";

// Setup uploads folder
const reviewUploadDir = path.resolve("uploads/reviews");
if (!fs.existsSync(reviewUploadDir)) fs.mkdirSync(reviewUploadDir, { recursive: true });

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, reviewUploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

// File filter and limits
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed."));
    }
  },
}).fields([
  { name: "images", maxCount: 3 },
  { name: "video", maxCount: 1 },
]);

// Middleware for file handling
export const handleReviewUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError || err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// POST /api/reviews/:productId
export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const { productId } = req.params;
  const userId = req.user._id;

  if (!rating || !comment) {
    return res.status(400).json({ message: "Rating and comment are required." });
  }

  const images = req.files?.images?.map((f) => f.filename) || [];
  const video = req.files?.video?.[0]?.filename || null;

  const review = new Review({
    userId,
    productId,
    rating,
    comment,
    images,
    video,
  });

  await review.save();

  res.status(201).json({
    message: "Review submitted successfully",
    review,
  });
});

// GET /api/reviews/:productId
export const getReviewsByProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const reviews = await Review.find({ productId })
    .sort({ createdAt: -1 })
    .populate("userId", "name email");

  res.status(200).json(reviews);
});