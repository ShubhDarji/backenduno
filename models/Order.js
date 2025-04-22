import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
        productName: String,
        price: Number,
        qty: Number,
        image: String,
        status: {
          type: String,
          enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
          default: "Pending", // ✅ Individual item status
        },
      },
    ],
    totalAmount: Number,
    address: String,
    phoneNumber: String,
    paymentMethod: { type: String, enum: ["Cash on Delivery", "Online Payment"], required: true },
    overallStatus: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending", // ✅ Automatically updated based on item statuses
    },
    paymentStatus: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" },
  },
  { timestamps: true }
);

/** ✅ Pre-save hook to dynamically update overallStatus */
orderSchema.pre("save", function (next) {
  const itemStatuses = this.items.map((item) => item.status);

  if (itemStatuses.every((status) => status === "Delivered")) {
    this.overallStatus = "Delivered"; // ✅ All items delivered
  } else if (itemStatuses.every((status) => status === "Cancelled")) {
    this.overallStatus = "Cancelled"; // ✅ All items canceled
  } else if (itemStatuses.some((status) => status === "Shipped") && itemStatuses.every((status) => ["Shipped", "Delivered"].includes(status))) {
    this.overallStatus = "Shipped"; // ✅ At least one item shipped, rest are shipped or delivered
  } else if (itemStatuses.some((status) => status === "Processing")) {
    this.overallStatus = "Processing"; // ✅ At least one item is processing
  } else {
    this.overallStatus = "Pending"; // ✅ Default to pending if nothing has shipped or processed
  }

  next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;