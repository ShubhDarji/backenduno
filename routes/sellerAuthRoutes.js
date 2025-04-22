import express from "express";
import {sellerSignup, loginSeller} from "../controllers/sellerAuthController.js";

const router = express.Router();

router.post("/signup", sellerSignup);
router.post("/login", loginSeller);

export default router;
