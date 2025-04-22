import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const sellerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    businessName: { type: String, required: true },
    gstNumber: {
      type: String,
      required: true,
      unique: false,  // ✅ Ensure GST is unique
      uppercase: true,
      match: [/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d{1}[Z]{1}[A-Z0-9]{1}$/, "Invalid GST Number"]
    },
    role: { type: String, default: "seller" },
    address: { type: String, required: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: "default-seller.png" },
    verificationCode: String,
codeExpiry: Date,
isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before saving
sellerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  console.log("Hashing password:", this.password);
  this.password = await bcrypt.hash(this.password, 10);
  
  console.log("Hashed password:", this.password);
  next();
});
sellerSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Compare password method
sellerSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ Generate JWT Token
sellerSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id, email: this.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const Seller = mongoose.model("Seller", sellerSchema);
export default Seller;