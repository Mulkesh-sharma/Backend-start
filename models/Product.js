// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [1, 'Price must be positive'],
  },
  quantity: {
    type: Number,
    required: [true, 'Product quantity is required'],
    min: [1, 'Quantity must be positive']
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
productSchema.index({ owner: 1, name: 1 });

module.exports = mongoose.model('Product', productSchema);
