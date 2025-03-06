import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import Seller from "../models/Seller.js";

// ✅ Admin Login Function
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Check if admin exists
    const admin = await User.findOne({ email });

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access Denied - Admins only" });
    }

    // ✅ Validate password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // ✅ Generate JWT Token
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Admin login successful",
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Get All Users (Admin Only)
export const getAllUsers = async (req, res) => {
  try {
    console.log("📡 Fetching all users, sellers, and admins...");

    const users = await User.find({}, "-password");
    const sellers = await Seller.find({}, "-password");
    const admins = await Admin.find({}, "-password");

    console.log("✅ Users:", users);
    console.log("✅ Sellers:", sellers);
    console.log("✅ Admins:", admins);

    if (!users.length && !sellers.length && !admins.length) {
      return res.status(404).json({ success: false, message: "No users found" });
    }

    res.json({ success: true, users, sellers, admins });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// ✅ Approve Seller
// ✅ Approve Seller
export const approveSeller = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Searching for seller with ID: ${id}`);

    const seller = await Seller.findById(id);

    if (!seller) {
      console.log("❌ Seller not found!");
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    seller.isApproved = true;
    await seller.save();

    console.log("✅ Seller approved successfully!");
    res.json({ success: true, message: "Seller approved successfully!" });
  } catch (error) {
    console.error("❌ Approval error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};



// ✅ Delete Seller
export const deleteSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await User.findById(id);

    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    if (seller.role !== "seller") {
      return res.status(400).json({ success: false, message: "Only sellers can be deleted" });
    }

    await User.findByIdAndDelete(id);

    res.json({ success: true, message: "Seller deleted successfully!" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
