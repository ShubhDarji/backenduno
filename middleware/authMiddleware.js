import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Seller from "../models/Seller.js";
import Admin from "../models/Admin.js";
// ✅ Protect General Users
export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ Protect Sellers
export const protectSeller = async (req, res, next) => {
  try {
    const token = req.cookies.sellerToken;
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.seller = await Seller.findById(decoded.id).select("-password");

    if (!req.seller) return res.status(401).json({ message: "Unauthorized" });

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};




// ✅ Protect Admins (Ensure user role is 'admin')
export const protectAdmin = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(" ")[1]; // Get Bearer Token
    if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) return res.status(401).json({ message: "Unauthorized: Admin not found" });

    req.admin = admin; // Attach admin to request
    next();
  } catch (error) {
    console.error("❌ Admin Auth Error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};


