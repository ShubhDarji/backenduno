import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Seller from "../models/Seller.js";
import Admin from "../models/Admin.js";
import asyncHandler from "express-async-handler";

const verifyToken = (req) => {
  const authHeader = req.headers.authorization;
  console.log("🔎 Authorization Header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized! No token provided.");
  }
  return authHeader.split(" ")[1];
};


// ✅ Protect General Users
// authMiddleware.js


// authMiddleware.js

// authMiddleware.js

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error('Not authorized, token failed');
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};


// ✅ Protect Sellers
export const protectSeller = asyncHandler(async (req, res, next) => {
  console.log("🔎 Checking Seller Token");
  
  try {
    const token = verifyToken(req);
    console.log("🔑 Token Received:", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "seller") {
      console.log("🚫 Not a seller. Role:", decoded.role);
      return res.status(403).json({ message: "Forbidden: Not a seller" });
    }

    const seller = await Seller.findById(decoded.id).select("-password");
    if (!seller) {
      console.log("❗ Seller not found");
      return res.status(404).json({ message: "Unauthorized: Seller not found" });
    }

    req.seller = seller;
    console.log("✅ Seller Verified:", seller.email);
    next();
  } catch (error) {
    console.error("❌ Seller Auth Error:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});





// ✅ Protect Admins
export const protectAdmin = asyncHandler(async (req, res, next) => {
  try {
    const token = verifyToken(req);
    console.log("🔎 Admin Token Received:", token);

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token Decoded:", decoded);

    // Check if the role is admin
    if (decoded.role !== "admin") {
      console.warn("🚫 Access Denied: Not an admin.");
      return res.status(403).json({ message: "Forbidden: Access restricted to admins only." });
    }

    // Fetch admin details from the database
    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      console.error("❗ Admin not found with ID:", decoded.id);
      return res.status(404).json({ message: "Unauthorized: Admin not found." });
    }

    req.admin = admin; // Attach admin to request object
    console.log("✅ Admin Verified:", admin.email);
    next();
  } catch (error) {
    console.error("❌ Admin Auth Error:", error.message || error);
    const statusCode = error.name === "JsonWebTokenError" || error.name === "TokenExpiredError" 
      ? 401 
      : 500;
    res.status(statusCode).json({ message: error.message || "Failed to authenticate admin." });
  }
});

// ✅ Verify Token without Role Restriction
export const verifyTokenMiddleware = (req, res, next) => {
  const token = verifyToken(req);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded data to req
    next();
  } catch (error) {
    console.error("❌ Token Verification Error:", error);
    res.status(403).json({ message: "Invalid or expired token!" });
  }
};




export const verifySellerToken = asyncHandler(async (req, res, next) => {
  try {
    const token = verifyToken(req);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const seller = await Seller.findById(decoded.id).select("-password");
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    req.seller = seller;
    next();
  } catch (error) {
    console.error("Token Error:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});



export const verifySellerId = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const seller = await Seller.findById(decoded.id);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found." });
    }

    // 🛑 Ensure seller can only update their own orders
    if (req.params.sellerId && req.params.sellerId !== decoded.id) {
      return res.status(403).json({ message: "Forbidden: You are not allowed to access this resource." });
    }

    req.sellerId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
});





