const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  price: Number,
  image: String,
  category: String,
});

const product = mongoose.model("product", productSchema);

module.exports = product;
