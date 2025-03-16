import Order from "../models/Order.js";
import Product from "../models/Product.js";

// ✅ Place an Order
export const createOrder = async (req, res) => {
  try {
    const { productId, quantity, paymentMethod, shippingAddress } = req.body;

    const product = await Product.findById(productId);
    if (!product || product.stock < quantity) {
      return res.status(400).json({ message: "Product not available or out of stock" });
    }

    const totalPrice = product.price * quantity;

    const newOrder = new Order({
      customerId: req.user._id,
      sellerId: product.sellerId,
      productId,
      quantity,
      totalPrice,
      paymentMethod,
      shippingAddress,
    });

    await newOrder.save();

    // ✅ Reduce product stock
    product.stock -= quantity;
    await product.save();

    res.status(201).json({ message: "Order placed successfully!", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Error placing order" });
  }
};

// ✅ Get Orders for a Customer
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user._id }).populate("productId");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// ✅ Get Orders for a Seller
export const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ sellerId: req.seller._id }).populate("productId");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching seller orders" });
  }
};

// ✅ Get All Orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("productId sellerId customerId");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all orders" });
  }
};

// ✅ Get a Single Order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("productId sellerId customerId");
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order" });
  }
};

// ✅ Update Order Status (Seller Only)
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.sellerId.toString() !== req.seller._id.toString()) {
      return res.status(403).json({ message: "Unauthorized: You can only update your own orders" });
    }

    order.orderStatus = req.body.orderStatus || order.orderStatus;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ message: "Error updating order status" });
  }
};

// ✅ Cancel Order (Customer Only)
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized: You can only cancel your own orders" });
    }

    if (order.orderStatus !== "Pending") {
      return res.status(400).json({ message: "Only pending orders can be canceled" });
    }

    order.orderStatus = "Cancelled";
    await order.save();

    res.json({ message: "Order canceled successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Error canceling order" });
  }
};
