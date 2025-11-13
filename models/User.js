// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  // Additional profile fields
  storeName: { type: String, default: "" },
  ownerName: { type: String, default: "" },
  storeType: { type: String, default: "" },
  phone: { type: String, default: "" },
  googleId: { type: String, sparse: true },
  avatar: { type: String },

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
