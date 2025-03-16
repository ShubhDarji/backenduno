import express from "express";
import multer from "multer";
import { protectSeller } from "../middleware/authMiddleware.js";
import {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// ✅ Multer Storage Setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// ✅ Create Product (Seller Only)
router.post(
  "/add",
  protectSeller,
  upload.fields([
    { name: "primaryImage", maxCount: 1 },
    { name: "secondaryImages", maxCount: 5 },
  ]),
  addProduct
);

// ✅ Get All Products (Public)
router.get("/", getProducts);

// ✅ Get Single Product (Public)
router.get("/:id", getProductById);

// ✅ Update Product (Seller Only)
router.put("/:id", protectSeller, updateProduct);

// ✅ Delete Product (Seller Only)
router.delete("/:id", protectSeller, deleteProduct);

export default router;
