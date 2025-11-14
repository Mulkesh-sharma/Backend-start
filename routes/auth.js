const express = require("express");
const auth = require("../middleware/authMiddleware");

const {
  signup,
  login,
  googleLogin,
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/authController.js");

const router = express.Router();

// Signup
router.post("/signup", signup);

// Google login
router.post("/google", googleLogin);

// Email/password login
router.post("/login", login);

// Get profile
router.get("/profile", auth, getProfile);

// Update profile
router.put("/profile", auth, updateProfile);

// Change password
router.put("/change-password", auth, changePassword);

module.exports = router;
