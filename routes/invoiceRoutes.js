import express from "express";
import { getUserInvoices, getSellerInvoices, getAllInvoices } from "../controllers/invoiceController.js";
import { protect, protectSeller, protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ User Invoices
router.get("/", protect, getUserInvoices);

// ✅ Seller Invoices
router.get("/seller", protectSeller, getSellerInvoices);

// ✅ Admin Invoices
router.get("/admin", protectAdmin, getAllInvoices);

export default router;
