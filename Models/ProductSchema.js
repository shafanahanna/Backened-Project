const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  price: Number,
  image: String,
  category: String,
});

const products = mongoose.model("product", productSchema);

module.exports = products;
