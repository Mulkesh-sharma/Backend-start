const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

require("dotenv").config();

// Routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/productRoutes"); // <-- NEW

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to DB
connectDB();

// Test Route
app.get("/", (req, res) => {
  res.send("✅ Backend Running & Connected to MongoDB");
});

// Auth Routes (public)
app.use("/auth", authRoutes);

// Product Routes (protected inside router)
app.use("/products", productRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
