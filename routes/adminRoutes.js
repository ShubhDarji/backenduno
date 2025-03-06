import express from "express";
import { adminLogin, getAllUsers, approveSeller, deleteSeller } from "../controllers/adminController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Admin login route
router.post("/login", adminLogin);

// ✅ Protected admin routes
router.get("/users", protectAdmin, getAllUsers);
router.put("/approve-seller/:id", protectAdmin, approveSeller);
router.delete("/delete-seller/:id", protectAdmin, deleteSeller);


export default router;
