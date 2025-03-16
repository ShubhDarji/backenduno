import express from "express";
import { protect, protectSeller, protectAdmin } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getMyOrders,
  getSellerOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/orderController.js";

const router = express.Router();

// ✅ Place Order
router.post("/create", protect, createOrder);

// ✅ Get Customer Orders
router.get("/my-orders", protect, getMyOrders);

// ✅ Get Seller Orders
router.get("/seller-orders", protectSeller, getSellerOrders);

// ✅ Get All Orders (Admin)
router.get("/all", protectAdmin, getAllOrders);

// ✅ Get Order by ID
router.get("/:id", protect, getOrderById);

// ✅ Update Order Status (Seller)
router.put("/update/:id", protectSeller, updateOrderStatus);

// ✅ Cancel Order (Customer)
router.put("/cancel/:id", protect, cancelOrder);

export default router;
