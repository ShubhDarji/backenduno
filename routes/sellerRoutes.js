import express from "express";
import { registerSeller, loginSeller, getSellerDashboard , getSellerProfile } from "../controllers/sellerController.js";
import multer from "multer";
import { protectSeller } from "../middleware/authMiddleware.js";
const router = express.Router();

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
            cb(null, file.originalname);
        }
    });
    const upload = multer({ storage });
  
// ✅ Seller Registration Route
router.post("/register", upload.single("proof"), registerSeller);

// ✅ Seller Login Route
router.post("/login", loginSeller);

// ✅ Seller Dashboard Route (Protected)
router.get("/dashboard", getSellerDashboard);

router.get("/profile", protectSeller, getSellerProfile);

export default router;
