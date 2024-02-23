const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Users = require("../Models/UserSchema");
const UserSchema = require("../Models/UserSchema");
const products = require("../Models/ProductSchema");
const { joiProductSchema } = require("../Models/validationSchema");
const orderSchema = require("../Models/OrderSchema");

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
    // console.log(allUser, "ddddds");

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
    const { value, error } = joiProductSchema.validate(req.body);
    const { id, title, description, price, image, category } = value;

    console.log(req.body, "fgh");

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
      res.status(200).json({
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
      res.status(200).json({
        status: "sucess",
        message: "successfully fetched",
        data: product,
      });
    }
  },

  //delete products

  deleteProduct: async (req, res) => {
    const { id: productId } = req.params;
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        status: "failure",
        message: "invalid product id",
      });
    }
    try {
      const deletedProduct = await products.findOneAndDelete({
        _id: productId,
      });
      if (!deletedProduct) {
        return res.status(404).json({
          status: "failure",
          message: "product not found in database",
        });
      }
      return res
        .status(200)
        .json({ status: "success", message: "product deleted successfully" });
    } catch (error) {
      return res.status(500).json({
        status: "failure",
        message: "error",
        error_message: error.message,
      });
    }
  },

  //update product
  updateProduct: async (req, res) => {
    try {
      const { value, error } = joiProductSchema.validate(req.body);

      const { id, title, description, price, image, category } = value;
      console.log(title);
      if (error) {
        return res
          .status(401)
          .json({ status: "error", message: error.details[0].message });
      }

      const updatedProduct = await products.findByIdAndUpdate(
        id,
        { $set: { title, description, price, image, category } },
        { new: true }
      );
      console.log(updatedProduct);

      if (updatedProduct) {
        const updatedProducts = await products.findById(id);
        return res.status(200).json({
          status: "success",
          message: "Successfully updated the product.",
          data: updatedProducts,
        });
      } else {
        return res
          .status(404)
          .json({ status: "error", message: "Product not found" });
      }
    } catch (error) {
      console.error("Error updating product:", error);
      return res
        .status(500)
        .json({ status: "error", message: "Internal Server Error" });
    }
  },
  //Order Details

  AdminOrderDetails: async (req, res) => {
    const products = await orderSchema.find();
    if (products.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: " No order details" });
    }
    res.status(200).json({
      status: "success",
      message: "order details succeesfully fetched",
      order_data: products,
    });
  },

  // Total revenue Generated

  TotalRevenueStatus: async (req, res) => {
    const totalRevenue = await orderSchema.aggregate([
      {
        $group: {
          _id: null,
          totalProduct: { $sum: { $size: "$products" } },
          totalRevenue: { $sum: "$total_amount" },
        },
      },
    ]);
    if (totalRevenue.length > 0) {
      res.status(200).json({ status: "success", data: totalRevenue[0] });
    } else {
      res.status(200).json({
        status: "success",
        data: { totalProduct: 0, totalRevenue: 0 },
      });
    }
  },
};
