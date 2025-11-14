// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Password is optional because Google users do not have passwords
    password: { type: String, default: null },

    googleId: { type: String, sparse: true, default: null },

    // Avatar or Google picture
    picture: { type: String, default: null },

    // Additional profile fields
    storeName: { type: String, default: "" },
    ownerName: { type: String, default: "" },
    storeType: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
