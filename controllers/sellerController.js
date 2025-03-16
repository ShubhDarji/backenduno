import Seller from "../models/Seller.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const registerSeller = async (req, res) => {
  try {
    const { name, email, phone, businessName, gstNumber, address, password } = req.body;
    
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) return res.status(400).json({ message: "Seller already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newSeller = new Seller({ name, email, phone, businessName, gstNumber, address, password: hashedPassword });

    await newSeller.save();
    res.status(201).json({ message: "Seller registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error during registration" });
  }
};

export const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;
    const seller = await Seller.findOne({ email });

    if (!seller) return res.status(400).json({ message: "Seller not found" });

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: seller._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("sellerToken", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 86400000 });

    res.json({ message: "Login successful", seller });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getSellerProfile = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller.id).select("-password");
    res.json(seller);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
