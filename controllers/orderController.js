import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Seller from "../models/Seller.js";
import sendEmail from "../utils/sendEmail.js";
import sendLowStockEmail from "../utils/sendLowStockEmail.js";
import asyncHandler from "express-async-handler";
export const createOrder = async (req, res) => {
  try {
    const { userId, items, address, phoneNumber, paymentMethod } = req.body;

    // 1. Validate User
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // 2. Validate Payment Method
    const validPaymentMethods = ["Cash on Delivery", "Online Payment"];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method." });
    }

    // 3. Validate Products and Calculate Total
    let totalAmount = 0;
    const updatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      if (product.stock < item.qty) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.productName}. Available: ${product.stock}`,
        });
      }

      totalAmount += product.price * item.qty;

      updatedItems.push({
        productId: product._id,
        sellerId: product.sellerId,
        productName: product.productName,
        price: product.price,
        qty: item.qty,
        image: product.primaryImage || "",
        status: "Pending",
      });
    }

    // 4. Create Order
    console.log("🧾 Creating order with:", {
      userId,
      totalAmount,
      address,
      items: updatedItems,
      phoneNumber,
      paymentMethod,
    });

    const newOrder = await Order.create({
      userId,
      items: updatedItems,
      totalAmount,
      address,
      phoneNumber,
      paymentMethod,
      status: "Pending",
      paymentStatus: "Pending",
    });

    // 5. Update Product Stock + Notify Seller if Low
    await Promise.all(
      items.map(async (item) => {
        try {
          const product = await Product.findById(item.productId);
          const updatedStock = product.stock - item.qty;
          product.stock = updatedStock;

          if (updatedStock === 0) product.status = "Inactive";

          await product.save();

          // Notify if stock is low
          try {
            if ([3, 1, 0].includes(updatedStock)) {
              const seller = await Seller.findById(product.sellerId);
              if (seller?.email) {
                await sendLowStockEmail(seller.email, product, updatedStock);
              }
            }
          } catch (emailErr) {
            console.error(`❌ Failed to send low stock email:`, emailErr.message);
          }
        } catch (err) {
          console.error(`❌ Stock update error for ${item.productId}:`, err.message);
        }
      })
    );

    // 6. Email to User
    const userHtml = `
      <div style="font-family: 'Segoe UI', sans-serif; padding: 20px;">
        <h2 style="color: #2a7ae4;">Order Confirmation - Etek</h2>
        <p>Hi ${user.name},</p>
        <p>Thank you for your order. Here are your order details:</p>
        <ul>
          ${updatedItems
            .map(
              (item) =>
                `<li><strong>${item.productName}</strong> - Qty: ${item.qty} - ₹${item.price * item.qty}</li>`
            )
            .join("")}
        </ul>
        <p><strong>Total:</strong> ₹${totalAmount}</p>
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        <br />
        <p>We'll notify you when your order ships.</p>
      </div>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Order Placed Successfully",
        html: userHtml,
      });
    } catch (err) {
      console.error("❌ Email to user failed:", err.message);
    }

    // 7. Email to Sellers
    const sellerGrouped = {};
    updatedItems.forEach((item) => {
      if (!sellerGrouped[item.sellerId]) {
        sellerGrouped[item.sellerId] = [];
      }
      sellerGrouped[item.sellerId].push(item);
    });

    for (const [sellerId, sellerItems] of Object.entries(sellerGrouped)) {
      const seller = await Seller.findById(sellerId);
      if (!seller?.email) continue;

      const sellerHtml = `
        <div style="font-family: 'Segoe UI', sans-serif; padding: 20px;">
          <h2 style="color: #2a7ae4;">New Order Received - Etek</h2>
          <p>Hi ${seller.name || "Seller"},</p>
          <p>You have received a new order with the following items:</p>
          <ul>
            ${sellerItems.map(item => `<li><strong>${item.productName}</strong> - Qty: ${item.qty}</li>`).join("")}
          </ul>
          <p><strong>Customer:</strong> ${user.name} (${user.email})</p>
          <p>Please process it soon from your dashboard.</p>
        </div>
      `;

      try {
        await sendEmail({
          to: seller.email,
          subject: "New Order Received",
          html: sellerHtml,
        });
      } catch (err) {
        console.error(`❌ Email to seller ${sellerId} failed:`, err.message);
      }
    }

    // 8. Final Response
    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });

  } catch (error) {
    console.error("❌ Order Error:", error);
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

// ✅ Get Orders for User
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('items.productId', 'productName image price')
      .populate('items.sellerId', 'name email businessName profileImage')// ✅ Add this line
      .sort({ createdAt: -1 });

    if (!orders.length) return res.status(404).json({ message: 'No orders found.' });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders.', error: error.message });
  }
};

// ✅ Get Orders for Seller
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.seller._id; // Get seller ID from authentication middleware

    // Find orders where any item's sellerId matches the logged-in seller
    const orders = await Order.find({ "items.sellerId": sellerId })
      .populate("userId", "name email") // Populate user details
      .populate("items.productId", "productName image price") // Populate product details
      .sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this seller." });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    res.status(500).json({ message: "Failed to fetch seller orders.", error: error.message });
  }
};

// ✅ Get All Orders for Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('items.productId', 'productName image')
      .populate('items.sellerId', 'name email businessName profileImage') // ✅ Add this line
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};
// ✅ Update Order Status



import { generateInvoice } from "../utils/generateInvoice.js"; // make sure this exists

import path from "path";
import fs from "fs";

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentStatus } = req.body;

    const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    const validPaymentStatuses = ["Pending", "Completed", "Failed"];

    if (status && !validStatuses.includes(status))
      return res.status(400).json({ message: "Invalid order status" });

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus))
      return res.status(400).json({ message: "Invalid payment status" });

    const order = await Order.findById(orderId).populate("userId");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Apply updates
    if (status) {
      order.items = order.items.map(item => ({
        ...item.toObject(),
        status,
      }));
    }
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save(); // ✅ pre-save hook will recalculate overallStatus

    // ✅ Trigger invoice email if overallStatus becomes "Shipped"
    if (order.overallStatus === "Shipped") {
      const invoiceDir = path.resolve("invoices");
      if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir);

      const invoicePath = path.join(invoiceDir, `invoice-${order._id}.pdf`);
      await generateInvoice(order, order.userId, invoicePath);

      const html = `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Your Order is Shipped - Invoice Attached</h2>
          <p>Hi ${order.userId.name},</p>
          <p>Your order #<strong>${order._id}</strong> has been shipped. We've attached your invoice for reference.</p>
          <p>Thank you for shopping with Etek!</p>
        </div>
      `;

      await sendEmail({
        to: order.userId.email,
        subject: "Order Shipped - Invoice Attached",
        html,
        attachments: [
          {
            filename: `invoice-${order._id}.pdf`,
            path: invoicePath,
          }
        ]
      });
    }

    res.status(200).json({ message: "Order updated", order });
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    res.status(500).json({ message: "Failed to update order", error: error.message });
  }
};

// ✅ Cancel Order (By User)
// cancelOrderController.js or inside orderController.js

export const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  // Check if all items are still pending
  const allPending = order.items.every(item => item.status === "Pending");
  if (!allPending) {
    return res.status(400).json({ message: "Only orders with all items pending can be cancelled" });
  }

  // Cancel all items
  order.items = order.items.map(item => ({
    ...item.toObject(), // to preserve other item fields
    status: "Cancelled",
  }));

  const updatedOrder = await order.save();

  res.json({
    message: "Order cancelled successfully.",
    order: updatedOrder,
  });
});