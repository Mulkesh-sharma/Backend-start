// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/productRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// 🔌 Middlewares

app.use(express.json());

// Allow frontend access (React Native)
app.use(
  cors({
    origin: "*", // Or specify your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 📡 Connect to DB

connectDB();

// 🏠 Basic Route

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "✅ Backend Running Successfully & Connected!",
  });
});

// 📌 Public Routes

app.use("/auth", authRoutes);

// 🔐 Protected Product Routes
// (Auth is handled *inside* the router)
app.use("/products", productRoutes);

// 🚀 Start Server

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
