// controllers/authController.js

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

// Create JWT
const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/* ============================
      SIGNUP
=============================== */
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
    });

    const token = createToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture || null,
      },
    });
  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during signup",
    });
  }
};

/* ============================
      LOGIN
=============================== */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This account uses Google login only",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });

    const token = createToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture || null,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

/* ============================
      GOOGLE LOGIN
=============================== */
export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "No ID token provided by Google",
      });
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_WEB_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload.email?.toLowerCase();
    const name = payload.name || "Google User";
    const picture = payload.picture || "";
    const googleId = payload.sub;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google token missing email",
      });
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: null, // Google accounts have no password
        googleId,
        picture,
      });
    } else {
      const updates = {};
      if (name && user.name !== name) updates.name = name;
      if (picture && user.picture !== picture) updates.picture = picture;

      if (Object.keys(updates).length > 0) {
        user = await User.findByIdAndUpdate(user._id, updates, { new: true });
      }
    }

    const token = createToken(user._id);

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error("Google login error:", err);
    return res.status(400).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};

/* ============================
      PROFILE
=============================== */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    return res.json({ success: true, user });
  } catch (err) {
    console.error("Profile Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching profile",
    });
  }
};

/* ============================
      UPDATE PROFILE
=============================== */
export const updateProfile = async (req, res) => {
  try {
    const body = req.body || {};

    const allowed = [
      "name",
      "storeName",
      "ownerName",
      "storeType",
      "phone",
      "email",
    ];
    const updates = {};

    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (updates.email) {
      const exists = await User.findOne({
        email: updates.email.toLowerCase(),
        _id: { $ne: req.user.userId },
      });
      if (exists)
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });

      updates.email = updates.email.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true }
    ).select("-password");

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    return res.json({ success: true, user, message: "Profile updated" });
  } catch (err) {
    console.error("Update Profile Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error updating profile",
    });
  }
};

/* ============================
      CHANGE PASSWORD
=============================== */
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body || {};

    if (!oldPassword || !newPassword)
      return res.status(400).json({
        success: false,
        message: "Old and new passwords are required",
      });

    const user = await User.findById(req.user.userId);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (!user.password)
      return res.status(400).json({
        success: false,
        message: "Google account cannot change password",
      });

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match)
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return res.json({ success: true, message: "Password updated" });
  } catch (err) {
    console.error("Change Password Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error changing password",
    });
  }
};
