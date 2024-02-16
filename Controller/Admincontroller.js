const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Users = require("../Models/UserSchema");
const UserSchema = require("../Models/UserSchema");
const { joiproductSchema } = require("../Models/ProductSchema");
const products = require("../Models/ProductSchema");

module.exports = {
  login: async (req, res) => {
    const { email, password } = req.body;
    // console.log(process.env.ADMIN_EMAIL);

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { email: email },
        process.env.ADMIN_ACCESS_TOKEN_SECRET
      );
      return res.status(200).json({
        status: "success",
        message: "Admin registration successfull",
        Token: token,
      });
    } else {
      return res
        .status(404)
        .json({ status: "error", message: "This is not an admin" });
    }
  },
  //find all users

  allUser: async (req, res) => {
    const allUser = await UserSchema.find();

    if (allUser.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    } else {
      res.status(200).json({
        status: "success",
        message: "successfully fetched user data",
        data: allUser,
      });
    }
  },
  //Specific user
  useById: async (req, res) => {
    const userId = req.params.id;
    const user = await Users.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "user not found" });
    } else {
      res.status(200).json({
        status: "success",
        message: "successfully find the user",
        data: user,
      });
    }
  },

  //to create product

  createProduct: async (req, res) => {
    const { value, error } = joiproductSchema.validate(req.body);
    const { id, title, description, price, image, category } = value;

    // console.log(value);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    } else {
      await products.create({
        id,
        title,
        description,
        price,
        image,
        category,
      });
      res.status(201).json({
        status: "success",
        message: "successfully created products",
        data: products,
      });
    }
  },
  // view all products by category

  allProducts: async (req, res) => {
    const prdcts = await products.find();
    // console.log(prdcts,"this is to viw prdcts");
    if (!prdcts) {
      return (
        res.status(404),
        send({ status: "error", message: "products not found" })
      );
    } else {
      res
        .status(200)
        .json({
          status: "sucess",
          message: "successfully fetched",
          data: prdcts,
        });
    }
  },

  // search product by id

  productById: async (req, res) => {
    const productId = req.params.id;
    const product = await products.findById(productId);
    if (!product) {
      return res
        .status(404)
        .send({ status: "error", message: "product not found" });
    } else {
      res
        .status(200)
        .json({
          status: "sucess",
          message: "successfully fetched",
          data: product,
        });
    }
  },

  //delete products

  deleteProduct: async (req, res) => {
    const { productId } = req.body;
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        status: "failure",
        message: "invalid product id",
      });
    }
    const deletedProduct = await products.findOneAndDelete({ id: productId });
    if (!deletedProduct) {
      return res
        .status(404)
        .json({ status: "success", message: "product not found in database" });
    }
  },
  //update product

  updateProduct: async (req, res) => {
    const { value, error } = joiproductSchema.validate(req.body);
    if (error) {
      return res.status(401).send({ message: error.details[0].message });
    }
    const { id, title, description, price, image, category } = value;
    const product = await products.find();

    if (!product) {
      return res
        .send(404)
        .json({ status: "failed", message: "product not found" });
    }
    await products.findByIdAndUpdate(
      { _id: id },
      { title, description, price, image, category }
    );
    res
      .status(200)
      .json({ status: "success", message: "product updated successfully" });
  },
};
