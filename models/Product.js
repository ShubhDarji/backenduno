import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required:false,
    },
    productName: { type: String, required:false },
    category: { type: String, required:false },
    companyName: { type: String, required:false },
    originalPrice: { type: Number, required:false },
    price: { type: Number, required:false },
    stock: { type: Number, required:false },
    shortDesc: { type: String, required:false }, // Make shortDesc required
    description: { type: String, required:false },
    returnPolicy: { type: String },
    status: { type: String, default: "Active", enum: ["Active", "Inactive"] },
    primaryImage: { type: String, required:false },
    secondaryImages: [{ type: String }],
    specifications: { type: String },
shippingPolicy: { type: String },
returnPolicy: { type: String },
  },
  { timestamps:true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;