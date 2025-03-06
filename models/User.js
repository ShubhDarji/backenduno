import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    profilePicture: { type: String, default: "" },
    dob: { type: String, default: "" },
    gender: {
      type: String,
      enum: ["male", "female", "other"], // Keep lowercase values
      required: true,
      set: (value) => value.toLowerCase(), // Convert input to lowercase
    },
    address: { type: String, default: "" },
    role: {
      type: String,
      enum: ["admin", "seller", "customer"],
      default: "customer", // ✅ New field: Default is "customer"
    },
    businessName: { type: String },
    gstNumber: { type: String },
    proof: { type: String }, // File path for business proof
    isApproved: { type: Boolean, default: false }, // Admin Approval
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
