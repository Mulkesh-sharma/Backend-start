const express = require('express');
const connectDB = require('./db');
const Product = require('./models/Product');
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");


require("dotenv").config();  // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Auth Routes
app.use("/auth", authRoutes);

// Connect to MongoDB
connectDB();

// TEST Route
app.get('/', (req, res) => res.send('Connected to MongoDB 🚀 Backend Running...'));

// GET all products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ADD product (Protected)
app.post('/products', authMiddleware, async (req, res) => {
  try {
    const { name, price } = req.body;
    const newProduct = new Product({ name, price });
    await newProduct.save();
    res.status(201).json({ message: 'Product added!', product: newProduct });
  } catch (err) {
    res.status(500).json({ message: "Failed to add product" });
  }
});

// UPDATE product (Protected)
app.put('/products/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ message: 'Product updated!', product: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update product" });
  }
});

// DELETE product (Protected)
app.delete('/products/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted!', deleted });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product" });
  }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
