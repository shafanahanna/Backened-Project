const bcrypt = require("bcrypt");
const User = require("../Models/UserSchema");
const { joiUserSchema } = require("../Models/validationSchema");
const jwt = require("jsonwebtoken");
const products = require("../Models/ProductSchema");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/Backend");

module.exports = {
  //userregister
  userRegister: async (req, res) => {
    const { value, error } = joiUserSchema.validate(req.body);
    const { name, email, phonenumber, username, password } = value;
    const hashedPassword = await bcrypt.hash(password, 10);
    if (error) {
      res.status(400).json({
        status: "Error",
        message: "Invalid user input.Please check data",
      });
    }
    await User.create({
      name: name,
      email: email,
      phonenumber: phonenumber,
      username: username,
      password: hashedPassword,
    });
    res
      .status(201)
      .json({ status: "status", messaga: "user registration Successsfull" });
    console.log(username, "hhhhh");
  },

  //userlogin
  userLogin: async (req, res) => {
    const { value, error } = joiUserSchema.validate(req.body);

    if (error) {
      res.json(error.message);
    }

    const { username, password } = value;
    const user = await User.findOne({ username: username });
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "user not found" });
    }
    if (!password || !user.password) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid input" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ error: "error", message: "incorrect password" });
    }

    const token = jwt.sign(
      { username: user.username },
      process.env.USER_ACCESS_TOKEN_SECRET,
      { expiresIn: 43200 }
    );
    res
      .status(200)
      .json({ status: "success", message: "Login Sucessfully", Token: token });
  },

  // view the product

  viewProduct: async (req, res) => {
    const product = await products.find();
    if (!product) {
      res.status(404).send({ status: "error", message: "product not found" });
    }
    res.status(200).send({
      status: "success",
      message: "successfully fetched data",
      data: product,
    });
  },

  //specific product by Id

  productById: async (req, res) => {
    const productId = req.params.id;
    const product = await products.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ status: "error", message: "product not found" });
    }
    res.status(200).json({ status: "success", data: product });
  },

  //add to cart

  addToCart: async (req, res) => {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .send({ status: "failed", message: "user not found" });
    }

    const { productId } = req.body;

    if (!productId) {
      return res
        .status(404)
        .send({ status: "failed", message: "product not found" });
    }
    await User.updateOne({ id: userId }, { $addToSet: { cart: productId } });
    res.status(200).send({
      status: "success",
      message: "successfully product was added to cart",
    });
  },

  //view the added product in cart

  viewCartProduct: async (req, res) => {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ status: "failed", message: "user not found" });
    }

    const cartProductsId = user.cart;
    if (cartProductsId.length === 0) {
      return res
        .status(200)
        .json({ status: "success", message: "cart is empty", data: [] });
    }
    const cartProducts = await products.find({ _id: { $in: cartProductsId } });
    res.status(200).json({
      status: "success",
      message: "fetched the product successfully",
      data: cartProducts,
    });
  },

  // add to wishlist

  addtowishlist: async (req, res) => {
    const userId = req.params.id;
    if (!userId) {
      return res
        .status(404)
        .json({ status: "failure", message: "user not found" });
    }

    const { productId } = req.body;
    const user = await User.findById(userId);

    // console.log("ghj");

    if (!user) {
      return res
        .status(404)
        .json({ status: "failure", message: "no product found" });
    }

    const findProduct = await User.findOne({
      _id: userId,
      wishlist: productId,
    });
    // console.log(findProduct,"ghhhj");
    if (!findProduct) {
      return res
        .status(404)
        .json({ status: "failure", message: "Product is already in wishlist" });
    }

    const updateResult = await User.updateOne(
      { _id: userId },
      { $push: { wishlist: productId } }
    );

    // console.log(updateResult,"dddddss");

    return res.status(201).json({
      status: "success",
      message: "Product successfully added to wishlist",
      data: updateResult,
    });
  },

  // Show wishlist

  showWishlist: async (req, res) => {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "failure", message: "user not found" });
    }
    const wishproductId = user.wishlist;
    if (wishproductId.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "user wishlist is empty",
        data: [],
      });
    }
    const wishProducts = await products.find({ _id: { $in: wishproductId } });
    res.status(200).json({
      status: "success",
      message: "wishlist products fetched successfully",
      data: wishProducts,
    });
  },

  //delete products from wishlist

  deletewishlist: async (req, res) => {
    const userId = req.params.id;
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "product not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ status: "not found", message: "user not found" });
    }

    await User.updateOne({ _id: userId }, { $pull: { wishlist: productId } });
    res.status(200).json({ message: "Removed from wishlist" });
  },
};
