import Seller from "../models/Seller.js"; // Ensure the file name matches exactly

import Order from "../models/Order.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ Seller Registration
// Ensure there is ONLY ONE declaration of `registerSeller`
export const registerSeller = async (req, res) => {
  try {
    const { name, email, phone, businessName, gstNumber, address, password } = req.body;
    const proof = req.file; // Ensure file is uploaded

    // ✅ Check for missing fields
    if (!name || !email || !phone || !businessName || !gstNumber || !address || !password || !proof) {
      return res.status(400).json({ message: "All fields are required, including business proof." });
    }

    // ✅ Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ message: "Seller already registered with this email." });
    }

    // ✅ Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Save the new seller
    const newSeller = new Seller({
      name,
      email,
      phone,
      businessName,
      gstNumber,
      address,
      password: hashedPassword,
      proof: `/uploads/${proof.filename}`, // Store uploaded file path
      isApproved: false,
    });

    await newSeller.save();
    res.status(201).json({ message: "Registration successful! Pending approval." });
  } catch (error) {
    console.error("Seller registration error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};





// ✅ Seller Login
export const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;

    const seller = await Seller.findOne({ email });
    if (!seller) return res.status(400).json({ message: "Seller not found" });

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (!seller.isApproved) return res.status(403).json({ message: "Approval pending" });

    const token = jwt.sign({ id: seller._id, role: "seller" }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, seller });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Seller Dashboard Data
export const getSellerDashboard = async (req, res) => {
  try {
    if (!req.seller) {
      return res.status(401).json({ message: "Unauthorized: No seller data" });
    }

    const sellerId = req.seller.id;

    const orders = await Order.find({ sellerId }).sort({ createdAt: -1 }).limit(5);
    const totalSales = await Order.aggregate([
      { $match: { sellerId } },
      { $group: { _id: null, totalSales: { $sum: "$total" } } },
    ]);

    res.json({
      totalSales: totalSales[0]?.totalSales || 0,
      totalOrders: orders.length,
      recentOrders: orders,
    });
  } catch (error) {
    console.error("Error in Seller Dashboard API:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Ensure all exports are correctly defined


// ✅ Fetch Seller Profile
export const getSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller.id).select("-password");
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    res.json(seller);
  } catch (error) {
    console.error("Error fetching seller profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

