const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/* =====================================================
   ✅ SIGNUP (Strong validation + clean messages)
   ===================================================== */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    let errors = [];

    if (!name || name.trim() === "") errors.push("Name is required");
    if (!email || email.trim() === "") errors.push("Email is required");
    if (!password || password.trim() === "")
      errors.push("Password is required");
    else if (password.length < 6)
      errors.push("Password must be at least 6 characters long");

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors.join(", "),
        errors,
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered. Please log in.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during signup",
    });
  }
});

/* =====================================================
   ✅ LOGIN (Clear errors + token generation)
   ===================================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    let errors = [];

    if (!email || email.trim() === "") errors.push("Email is required");
    if (!password || password.trim() === "") errors.push("Password is required");

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors.join(", "),
        errors,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email not found. Please signup.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during login",
    });
  }
});

/* =====================================================
   ✅ GET LOGGED-IN USER PROFILE
   ===================================================== */
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user)
      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    res.json({ success: true, user });
  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching profile",
    });
  }
});

module.exports = router;
