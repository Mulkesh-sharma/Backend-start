const express = require("express");
const Product = require("../models/Product");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// All product routes require authentication
router.use(auth);

/**
 * GET all products belonging only to the logged-in user
 */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ owner: req.user.userId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/**
 * ADD product (only for the logged-in user)
 */
router.post("/", async (req, res) => {
  try {
    const { name, price, quantity } = req.body;

    if (!name || !price || !quantity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newProduct = new Product({
      name,
      price,
      quantity,
      owner: req.user.userId,   // IMPORTANT 🔥 attach owner
    });

    await newProduct.save();

    res.status(201).json({
      message: "Product added!",
      product: newProduct,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to add product" });
  }
});

/**
 * UPDATE product (only if it belongs to the logged-in user)
 */
router.put("/:id", async (req, res) => {
  try {
    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId }, // filter by owner
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Product not found or unauthorized" });
    }

    res.json({ message: "Product updated!", product: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update product" });
  }
});

/**
 * DELETE product (only if it belongs to the logged-in user)
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.userId, // ensure user can only delete own product
    });

    if (!deleted) {
      return res.status(404).json({ message: "Product not found or unauthorized" });
    }

    res.json({ message: "Product deleted!", deleted });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product" });
  }
});

module.exports = router;
