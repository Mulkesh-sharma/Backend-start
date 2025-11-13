import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Missing Google ID Token",
      });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_WEB_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name || "Google User";
    const googleId = payload.sub;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Create random password (not used for Google login)
      const randomPassword = await bcrypt.hash(googleId + Date.now(), 10);

      user = await User.create({
        name,
        email,
        password: randomPassword,
        googleId,
      });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Remove password before sending user
    const safeUser = user.toObject();
    delete safeUser.password;

    return res.json({
      success: true,
      message: "Google login successful",
      data: {
        token,
        user: safeUser,
      },
    });

  } catch (err) {
    console.error("Google login error:", err);
    return res.status(400).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};
