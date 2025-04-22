import Seller from "../models/Seller.js";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";

// Generate JWT Token
const generateToken = (res, sellerId) => {
  const token = jwt.sign({ id: sellerId }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("sellerToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  return token;
};

// Seller Registration
export const sellerSignup = async (req, res) => {
  try {
    console.log("📩 Incoming Data:", req.body);

    const { name, email, password, phone, businessName, gstNumber, address } = req.body;
    if (!name || !email || !password || !phone || !businessName || !gstNumber || !address) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ message: "Seller already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    if (!hashedPassword) throw new Error("Password hashing failed!");

    const newSeller = new Seller({
      name,
      email,
      password: hashedPassword,
      phone,
      businessName,
      gstNumber,
      address,
    });

    await newSeller.save();
    console.log("✅ Seller Registered:", newSeller);

    res.status(201).json({ message: "Seller registered successfully" });
  } catch (error) {
    console.error("❌ Seller Signup Error:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};


// Seller Login
export const loginSeller = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const seller = await Seller.findOne({ email });
  if (!seller) return res.status(401).json({ message: "Invalid credentials!" });

  const isMatch = await seller.matchPassword(password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials!" });

  const token = generateToken(res, seller._id);
  res.json({ token, seller });
});

export const getSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller.id).select("-password");
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
