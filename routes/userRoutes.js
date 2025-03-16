import express from "express";
import { protect, protectAdmin } from "../middleware/authMiddleware.js";
import { signupUser, loginUser, getUserProfile, updateUserProfile, getUsers, deleteUser } from "../controllers/userController.js";

const router = express.Router();

// ✅ User Signup
router.post("/signup", signupUser);

// ✅ User Login
router.post("/login", loginUser); // ✅ Ensure this matches the controller

// ✅ Get User Profile (Protected)

// ✅ User Login
router.post("/login", loginUser); // ✅ Ensure this matches the controller

// ✅ Get User Profile (Protected)
router.get("/profile", protect, getUserProfile);

// ✅ Update User Profile (Protected)
router.put("/profile", protect, updateUserProfile);
router.delete("/:id", protectAdmin, deleteUser);


export default router;
