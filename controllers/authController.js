import User from "../models/User.js";
import Seller from "../models/Seller.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// 🔐 Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ✅ User Signup


export const userSignup = async (req, res) => {
  try {
    const { name, email, password, phone, gender, dob, address } = req.body;

    if (!name || !email || !password || !phone || !gender || !address) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const newUser = new User({
      name,
      email,
      password, // will be hashed in pre-save hook
      phone,
      gender,
      dob,
      address,
      verificationCode,
      codeExpiry,
      isVerified: false,
    });

    await newUser.save();

    await sendEmail({
      to: email,
      subject: "Verify Your Email",
      html: `
        <h2>Verify Your Account</h2>
        <p>Your 6-digit code is:</p>
        <h1>${verificationCode}</h1>
        <p>This code will expire in 10 minutes.</p>
      `,
    });

    res.status(201).json({ message: "User registered. Verification code sent to email." });
  } catch (error) {
    console.error("User Signup Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// ✅ User Login
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required." });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials." });

    if (!user.isVerified)
      return res.status(403).json({ message: "Please verify your email first." });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials." });

    const token = generateToken(user._id, "user");

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// ✅ Seller Signup
export const registerSeller = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      businessName,
      gstNumber,
      address,
      password,
    } = req.body;

    // 1. Validate all required fields
    if (!name || !email || !phone || !businessName || !gstNumber || !address || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // 2. Check for existing seller
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ message: "Seller already exists!" });
    }

    // 3. Generate verification code and expiry
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 4. Create new seller
    const newSeller = new Seller({
      name,
      email,
      phone,
      businessName,
      gstNumber,
      address,
      password, // Password hashing handled by model
      verificationCode,
      codeExpiry,
      isVerified: false,
    });

    await newSeller.save();

    // 5. Send verification email
    await sendEmail({
      to: email,
      subject: "Verify Your Seller Account",
      html: `
        <h2>Verify Your Seller Account</h2>
        <p>Your 6-digit verification code is:</p>
        <h1>${verificationCode}</h1>
        <p>This code is valid for 10 minutes.</p>
      `,
    });

    res.status(201).json({
      message: "Seller registered. Verification code sent to email.",
    });

  } catch (error) {
    console.error("Seller Signup Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Seller Loginimport Seller from "../models/Seller.js";

import sendEmail from "../utils/sendEmail.js"; // Make sure to import it at the top

export const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // 2. Find seller
    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // 3. Check email verification
    if (!seller.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    // 4. Compare password
    const isMatch = await seller.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // 5. Generate token
    const token = seller.generateAuthToken();

    // 6. Send login notification email
    await sendEmail({
      to: seller.email,
      subject: "Seller Login Notification",
      html: `
        <h2>Login Detected</h2>
        <p>Hello ${seller.name},</p>
        <p>Your seller account was just logged into on:</p>
        <p><strong>${new Date().toLocaleString()}</strong></p>
        <p>If this wasn’t you, please reset your password immediately.</p>
      `,
    });

    // 7. Respond with token and limited seller info
    res.status(200).json({
      token,
      seller: {
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        isVerified: seller.isVerified,
        businessName: seller.businessName,
      },
    });

  } catch (error) {
    console.error("Seller Login Error:", error);
    res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
};
export const verifySellerEmailCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const seller = await Seller.findOne({ email });
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    if (seller.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (seller.verificationCode !== code || seller.codeExpiry < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    seller.isVerified = true;
    seller.verificationCode = undefined;
    seller.codeExpiry = undefined;
    await seller.save();

    res.status(200).json({ message: "Seller email verified successfully!" });

  } catch (error) {
    console.error("Seller Email Verification Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
export const verifyUserEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.isVerified) return res.status(400).json({ message: "User already verified." });

    if (user.verificationCode !== code || user.codeExpiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired verification code." });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.codeExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully." });
  } catch (err) {
    console.error("Email Verification Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
