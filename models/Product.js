import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
    productName: { type: String, required: true },
    shortDesc: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    companyName: { type: String, required: true },
    originalPrice: { type: Number, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    returnPolicy: { type: String, required: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    primaryImage: { type: String, required: true },
    secondaryImages: [{ type: String, required: true }],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
