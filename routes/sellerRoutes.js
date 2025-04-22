import express from "express";
import { /* registerSeller *//* , loginSeller */ getSellerProfile } from "../controllers/sellerController.js";
import { protectSeller } from "../middleware/authMiddleware.js";

const router = express.Router();

/* router.post("/register", registerSeller);
router.post("/login", loginSeller); */
router.get("/profile", protectSeller, getSellerProfile);

export default router;
