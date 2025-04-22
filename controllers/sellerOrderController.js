import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";

// ✅ Fetch Orders for a Seller (With Product & User Details)
export const getSellerOrders = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  if (!sellerId) {
    return res.status(400).json({ message: "Seller ID is required." });
  }

  const orders = await Order.find({ "items.sellerId": sellerId })
    .populate("userId", "name email phone address")
    .populate("items.productId", "name primaryImage");

  if (!orders.length) {
    return res.status(404).json({ message: "No orders found." });
  }

  const formattedOrders = orders.map((order) => ({
    _id: order._id,
    user: {
      id: order.userId?._id,
      name: order.userId?.name || "N/A",
      email: order.userId?.email || "N/A",
      phone: order.userId?.phone || "N/A",
      address: order.userId?.address || "N/A",
    },
    shippingAddress: {
      address: order.address || "N/A",
      phone: order.phoneNumber || "N/A",
    },
    items: order.items
      .filter((item) => item.sellerId.toString() === sellerId)
      .map((item) => ({
        productId: item.productId?._id,
        productName: item.productId?.name || item.productName || "Unknown Product",
        image: item.productId?.primaryImage
          ? `${process.env.SERVER_URL || "http://localhost:5000"}/uploads/${item.productId.primaryImage}`
          : "https://via.placeholder.com/100",
        qty: item.qty,
        price: item.price,
        status: item.status || "Pending",
      })),
    status: order.status,
  }));

  res.status(200).json(formattedOrders);
});

// ✅ Update a Product Status within an Order


export const updateProductStatus = asyncHandler(async (req, res) => {
  const { orderId, productId } = req.params;
  const { status } = req.body;

  const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid product status" });
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // ✅ Find the Product inside the Order
    const product = order.items.find((item) => item.productId.toString() === productId);
    if (!product) return res.status(404).json({ message: "Product not found in this order" });

    // ✅ Ensure Seller Owns the Product
    if (product.sellerId.toString() !== req.seller._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to update this product" });
    }

    // ✅ Update Product Status
    product.status = status;

    // ✅ Recalculate Overall Order Status
    const itemStatuses = order.items.map((item) => item.status);

    if (itemStatuses.every((s) => s === "Delivered")) {
      order.status = "Delivered";
    } else if (itemStatuses.every((s) => s === "Cancelled")) {
      order.status = "Cancelled";
    } else if (itemStatuses.some((s) => s === "Shipped") && itemStatuses.some((s) => ["Processing", "Pending"].includes(s))) {
      order.status = "Processing";
    } else if (itemStatuses.some((s) => s === "Shipped")) {
      order.status = "Shipped";
    } else if (itemStatuses.every((s) => s === "Pending")) {
      order.status = "Pending";
    } else {
      order.status = "Processing";
    }

    await order.save();
    res.status(200).json({ message: "Product status updated successfully", order });
  } catch (error) {
    console.error("❌ Error updating product status:", error);
    res.status(500).json({ message: "Failed to update product status." });
  }
});