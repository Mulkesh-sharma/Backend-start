const express = require("express");
const Product = require("../models/Product");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// All routes require login
router.use(auth);

/**
 * ✅ GET ALL PRODUCTS (user-specific)
 */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ owner: req.user.userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    console.error("Get Products Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching products",
    });
  }
});

/**
 * ✅ ADD NEW PRODUCT (Smart validation)
 */
router.post("/", async (req, res) => {
  const { name, price, quantity } = req.body || {};

  let errors = [];

  // Validate fields one by one
  if (!name || name.trim() === "") errors.push("Product name is required");

  if (price === undefined || price === null || price === "")
    errors.push("Price is required");
  else if (Number(price) <= 0)
    errors.push("Price must be a positive number");

  if (quantity === undefined || quantity === null || quantity === "")
    errors.push("Quantity is required");
  else if (Number(quantity) <= 0)
    errors.push("Quantity must be a positive number");

  // If errors exist, stop and return all messages
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(", "),
      errors,
    });
  }

  // If all fields valid → save product
  try {
    const product = new Product({
      name,
      price,
      quantity,
      owner: req.user.userId,
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (err) {
    console.error("Add Product Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while adding product",
    });
  }
});

/**
 * ✅ UPDATE PRODUCT (smart validation for optional fields)
 */
router.put("/:id", async (req, res) => {
  const { name, price, quantity } = req.body || {};

  let errors = [];

  if (price !== undefined && Number(price) <= 0)
    errors.push("Price must be a positive number");

  if (quantity !== undefined && Number(quantity) <= 0)
    errors.push("Quantity must be a positive number");

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(", "),
      errors,
    });
  }

  try {
    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Product not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updated,
    });
  } catch (err) {
    console.error("Update Product Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while updating product",
    });
  }
});

/**
 * ✅ DELETE PRODUCT
 */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.userId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Product not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      deleted,
    });
  } catch (err) {
    console.error("Delete Product Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting product",
    });
  }
});

module.exports = router;
