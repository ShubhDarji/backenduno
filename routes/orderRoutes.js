import express from "express";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getSellerOrders, // ✅ New Controller
} from "../controllers/orderController.js";

import { protect, protectAdmin, protectSeller, verifySellerId } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ User Routes
router.post("/", protect, createOrder); // Create Order
router.get("/user", protect, getUserOrders); // Get User Orders
router.put("/:orderId/cancel", protect, cancelOrder); // Cancel Order

// ✅ Admin Routes
router.get("/admin", protectAdmin, getAllOrders); // Get All Orders (Admin)
router.put("/:orderId/status", protectAdmin, updateOrderStatus); // Update Order Status

// ✅ Seller Routes
router.get("/seller", protectSeller, getSellerOrders); // ✅ Get Orders for the Logged-in Seller

export default router;
