import express from "express";
import { userSignup, userLogin, registerSeller, loginSeller,verifySellerEmailCode, verifyUserEmail } from "../controllers/authController.js";

const router = express.Router();

router.post("/user/signup", userSignup);
router.post("/user/login", userLogin);
router.post("/user/verify-mail", verifyUserEmail);

router.post('/verify-code', verifySellerEmailCode);
router.post("/signup", registerSeller);
router.post("/login", loginSeller);
// GET /api/sellers/:sellerId

export default router;




