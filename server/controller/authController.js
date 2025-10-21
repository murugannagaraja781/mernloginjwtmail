import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModels.js";
import dotenv from "dotenv";
import transporter from "../config/nodemailer.js";

dotenv.config();

// ---------------- REGISTER ----------------
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.json({ success: false, message: "Missing details" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // REMOVE THIS COOKIE PART
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    return res.json({
      success: true,
      message: "Registration successful",
      token,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ---------------- LOGIN ----------------
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ success: false, message: "Missing details" });
  }

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, message: "Login successful", token });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ---------------- LOGOUT ----------------
export const logout = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });
  res.json({ success: true, message: "Logout successful" });
};

export const verifyMailOtp = async (req, res) => {
  const { userId, otp } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return res.json({ success: false, message: "User not found" });
  }

  if (user.accountVerified) {
    return res.json({ success: false, message: "Account already verified" });
  }

  if (user.verifyOtp !== otp || user.verifyOtpExpireAt < Date.now()) {
    return res.json({ success: false, message: "Invalid or expired OTP" });
  }

  user.accountVerified = true;
  user.verifyOtp = null;
  user.verifyOtpExpireAt = null;
  await user.save();

  res.json({ success: true, message: "Account verified successfully" });
};

export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (user.isAccountVerifed) {
      return res.json({ success: false, message: "Account already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000; // valid 10 minutes
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_MAILID,
      to: user.email,
      subject: "Your Verification OTP",
      text: `Your OTP for account verification is: ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "OTP sent mail successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing details" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.accountVerifed) {
      return res.json({ success: false, message: "Account already verified" });
    }

    if (user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    // ✅ Mark account as verified
    user.accountVerifed = true;
    user.verifyOtp = undefined;
    user.verifyOtpExpireAt = undefined;
    await user.save();

    res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
