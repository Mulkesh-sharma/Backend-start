// db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://mulkeshshaema:Ms123456@sharma.vctfu5b.mongodb.net/');
    console.log('✅ MongoDB Connected Successfully!');
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
  }
};

module.exports = connectDB;
