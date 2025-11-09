const express = require('express');
const connectDB = require('./db');
const Product = require('./models/Product');

const app = express();
const PORT = 5000;

app.use(express.json());

// Connect Database
connectDB();

// Routes
app.get('/', (req, res) => res.send('Connected to MongoDB 🚀'));

// GET all products
app.get('/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// POST add product
app.post('/products', async (req, res) => {
  const { name, price } = req.body;
  const newProduct = new Product({ name, price });
  await newProduct.save();
  res.status(201).json({ message: 'Product added!', product: newProduct });
});

// PUT update product
app.put('/products/:id', async (req, res) => {
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json({ message: 'Product updated!', product: updated });
});

// DELETE product
app.delete('/products/:id', async (req, res) => {
  const deleted = await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product deleted!', deleted });
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
