import express from "express";
import { getSellerOrders, updateProductStatus } from "../controllers/sellerOrderController.js";
import { verifySellerId, verifySellerToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Fetch orders for a seller (Protected)
router.get("/seller/:sellerId", verifySellerId, getSellerOrders);

// ✅ Update product status inside an order (Protected)
router.put("/:orderId/product/:productId/status", verifySellerToken, updateProductStatus);

export default router;