import express from "express";
import {
  uploadProductImages,
  addProduct,
  getProducts,
  getProductById,
  deleteProduct,
  updateProduct,
  getProductsBySeller,
  updateProductStatus ,
} from "../controllers/productController.js";
import upload from "../config/multerConfig.js";
import { protectSeller ,verifySellerToken,verifySellerId ,protectAdmin} from "../middleware/authMiddleware.js";
import { getHomeProducts } from "../controllers/productController.js";

const router = express.Router();

// ✅ Protect seller routes
// ✅ Add Product with Image Upload
router.post("/add", verifySellerToken, upload.fields([
  { name: "primaryImage", maxCount: 1 },
  { name: "secondaryImages", maxCount: 5 },
]), addProduct);

// Backend Route (Example)
router.put("/update/:id", verifySellerToken, upload.fields([
  { name: "primaryImage", maxCount: 1 },
  { name: "secondaryImages", maxCount: 5 },
]), updateProduct);

router.put('/status/:id', verifySellerToken, updateProductStatus);
router.put('/admin/status/:id', protectAdmin, updateProductStatus);

router.get("/", getProducts);
router.get("/seller", verifySellerId, getProductsBySeller);
router.get("/:id", getProductById);
router.put("/:id", verifySellerToken, protectSeller, updateProduct);
router.delete("/delete/:id", verifySellerToken, deleteProduct);

router.get("/home/products", getHomeProducts);
export default router;


