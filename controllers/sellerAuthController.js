import Seller from "../models/Seller.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const sellerSignup = async (req, res) => {
  try {
    const { name, email, phone, businessName, gstNumber, address, password } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !businessName || !gstNumber || !address || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ message: "Seller already exists!" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save seller
    const newSeller = new Seller({
      name,
      email,
      phone,
      businessName,
      gstNumber,
      address,
      password: hashedPassword,
    });

    await newSeller.save();
    res.status(201).json({ message: "Signup successful!" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

  export const loginSeller = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      console.log(`Login Attempt for: ${email}`);
  
      // Find seller
      const seller = await Seller.findOne({ email });
      if (!seller) return res.status(404).json({ message: "Seller not found!" });
  
      console.log(`Entered Password: ${password}`);
      console.log(`Stored Hashed Password: ${seller.password}`);
  
      // Compare password
      const isMatch = await bcrypt.compare(password, seller.password);
      console.log(`Password Match Status: ${isMatch}`);
  
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials!" });
  
      // Generate Token
      const token = jwt.sign({ id: seller._id, email: seller.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
  
      // Set token in HTTP-only cookie
      res.cookie("sellerToken", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
  
      res.status(200).json({ message: "Login successful!", token });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };