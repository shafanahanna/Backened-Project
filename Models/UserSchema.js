const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phonenumber: Number,
  username: String,
  password: String,
  cart: [{ type: mongoose.Schema.ObjectId, ref: "products" }],
  wishlist: [{ type: mongoose.Schema.ObjectId, ref: "products" }],
});

module.exports = mongoose.model("User", userSchema);
