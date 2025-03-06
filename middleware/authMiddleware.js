import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Seller from "../models/Seller.js"; // Ensure Seller model is imported
import dotenv from "dotenv";
import asyncHandler from "express-async-handler"; // Ensure asyncHandler is imported

dotenv.config();

export const protect = asyncHandler(async (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer")) {
    try {
      token = token.split(" ")[1]; // Extract token
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token

      req.user = await User.findById(decoded.id).select("-password"); // Fetch user data
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, invalid token");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }
});

// ✅ Middleware to protect seller routes
export const protectSeller = asyncHandler(async (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer")) {
    try {
      token = token.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.seller = await Seller.findById(decoded.id).select("-password");

      if (!req.seller) {
        res.status(401);
        throw new Error("Not authorized as a seller");
      }

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Invalid token");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }
});


export const protectAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    console.log("Admin Authenticated:", req.user); // ✅ Debugging log

    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access Denied - Admins only" });
    }

    next();
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
