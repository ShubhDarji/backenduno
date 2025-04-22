import Invoice from "../models/Invoice.js";
import asyncHandler from "express-async-handler";

// ✅ User Invoices
export const getUserInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({ user: req.user.id }).populate("order").sort({ createdAt: -1 });
  res.status(200).json(invoices);
});

// ✅ Seller Invoices
export const getSellerInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({ seller: req.seller.id }).populate("order").sort({ createdAt: -1 });
  res.status(200).json(invoices);
});

// ✅ Admin Invoices
export const getAllInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find().populate("order").populate("user", "name email").sort({ createdAt: -1 });
  res.status(200).json(invoices);
});
