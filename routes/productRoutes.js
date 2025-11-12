const express = require("express");
const Product = require("../models/Product");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Require auth for all routes
router.use(auth);

// GET all products (for logged-in user)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ owner: req.user.userId }).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    console.error("Get Products Error:", err);
    res.status(500).json({ success: false, message: "Server error fetching products" });
  }
});

// CREATE
router.post("/", async (req, res) => {
  try {
    const { name, price, quantity } = req.body;
    if (!name || !price || !quantity) return res.status(400).json({ success: false, message: "Missing fields" });

    const product = new Product({ name, price, quantity, owner: req.user.userId });
    await product.save();
    res.json({ success: true, product, message: "Product created" });
  } catch (err) {
    console.error("Create Product Error:", err);
    res.status(500).json({ success: false, message: "Server error creating product" });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { name, price, quantity } = req.body;
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      { $set: { name, price, quantity } },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: "Product not found or not authorized" });
    res.json({ success: true, product, message: "Product updated" });
  } catch (err) {
    console.error("Update Product Error:", err);
    res.status(500).json({ success: false, message: "Server error updating product" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({ _id: req.params.id, owner: req.user.userId });
    if (!deleted) return res.status(404).json({ success: false, message: "Product not found or not authorized" });
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("Delete Product Error:", err);
    res.status(500).json({ success: false, message: "Server error deleting product" });
  }
});

module.exports = router;
