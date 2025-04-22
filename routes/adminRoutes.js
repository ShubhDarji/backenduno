import express from "express";
import { protectAdmin } from "../middleware/authMiddleware.js";
import {
  adminSignup,
  adminLogin,
  adminLogout,
  getUsers,
  getSellers,
  approveSeller,
  rejectSeller,
  deleteUser,
  getOrders,
  updateOrderStatus,
  getProducts,
  approveProduct,
  deleteProduct,
} from "../controllers/adminController.js";

const router = express.Router();

// ✅ Admin Authentication
router.post("/signup", adminSignup);
router.post("/login", adminLogin);
router.post("/logout", protectAdmin, adminLogout);

// ✅ User & Seller Management
router.get("/users", protectAdmin, getUsers);
router.get("/sellers", protectAdmin, getSellers);
router.put("/seller/approve/:id", protectAdmin, approveSeller);
router.put("/seller/reject/:id", protectAdmin, rejectSeller);
router.delete("/user/:id", protectAdmin, deleteUser);

// ✅ Order Management
router.get("/orders", protectAdmin, getOrders);
router.put("/order/:id", protectAdmin, updateOrderStatus);

// ✅ Product Management
router.get("/products", protectAdmin, getProducts);
router.put("/product/approve/:id", protectAdmin, approveProduct);
router.delete("/product/:id", protectAdmin, deleteProduct);

export default router;
