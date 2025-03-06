import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  shortDesc: { type: String, required: true },
  description: { type: String, required: true },
  originalPrice: { type: Number, required: true },
  returnPolicy: { type: String, required: true },
  category: { type: String, required: true },
  companyName: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  primaryImage: { type: String, required: true },
  secondaryImages: { type: [String], required: true },
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

export default Product;
