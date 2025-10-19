import express from "express";
import {
  login,
  register,
  logout,
  sendVerifyOtp, // ✅ corrected spelling
  verifyMailOtp,
  verifyEmail,
} from "../controller/authController.js";
import userAuth from "../middleware/userAuth.js";

const authRouter = express.Router();

// Auth routes
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);

// Email verification routes
authRouter.post("/sendverifyotp", userAuth, sendVerifyOtp);
authRouter.post("/verifymailotp", userAuth, verifyMailOtp);
authRouter.post("/verifyemail", userAuth, verifyEmail);

export default authRouter;
