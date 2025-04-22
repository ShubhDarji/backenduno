import express from "express";
import { protect, protectAdmin } from "../middleware/authMiddleware.js";
import {
  signupUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
} from "../controllers/userController.js";7
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ✅ User Authentication
router.post("/signup", signupUser);
router.post("/login", loginUser);

// ✅ Profile Management (Protected)
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, upload.single("profilePicture"), updateUserProfile);

// ✅ Admin Routes
router.get("/", protectAdmin, getUsers);
router.delete("/:id", protectAdmin, deleteUser);

export default router;
