
import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    businessName: { type: String, required: true },
    gstNumber: { type: String, required: true },
    address: { type: String, required: true },
    password: { type: String, required: true },
    isApproved: { type: Boolean, default: false }, // Seller approval status
  },
  { timestamps: true }
);

// ✅ FIXED: Use `sellerSchema` (lowercase `s`)
export default mongoose.model("Seller", sellerSchema, "sellers"); 
