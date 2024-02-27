const bcrypt = require("bcrypt");
const User = require("../Models/UserSchema");
const { joiUserSchema } = require("../Models/validationSchema");
const jwt = require("jsonwebtoken");
const products = require("../Models/ProductSchema");
const Order = require("../Models/orderSchema");
const UserSchema = require("../Models/UserSchema");

const stripe = require("stripe")(process.env.stripe_secretkey);

let sValue = {};

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
    const existingUser = await User.findOne({ name: name });

    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "User with this name already exists",
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
      .json({ status: "status", message: "user registration Successsfull" });
    // console.log(username, "hhhhh");
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
    console.log(user, "pooooo");

    if (!user) {
      return res
        .status(404)
        .send({ status: "failed", message: "user not found" });
    }

    const { productId } = req.body;
    console.log("dfg", productId);

    if (!productId) {
      return res
        .status(404)
        .send({ status: "failed", message: "product not found" });
    }
    await User.updateOne({ _id: userId }, { $addToSet: { cart: productId } });
    res.status(200).send({
      status: "success",
      message: "successfully product was added to cart",
    });
  },

  updateCartItemQuantity: async (req, res) => {
    const userId = req.params.id;
    const { id, quantityChange } = req.body;
    // console.log(req.body,"hhhhhhhh");
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const cartItem = user.cart.id(id);
    if (!cartItem) {
      return res.status(404).json({ message: "cart item not found" });
    }

    cartItem.quantity += quantityChange;

    if (cartItem.quantity > 0) {
      await user.save();
    }
    res.status(200).json({
      status: "success",
      message: "cart item quantity updated",
      data: user.cart,
    });
  },
  removeCartProducts: async (req, res) => {
    const userId = req.params.id;
    const itemId = req.params.itemId;
    if (!itemId) {
      return res.status(404).json({ message: "product not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
    }
    const result = await User.updateOne(
      { _id: userId },
      { $pull: { cart: { productsId: itemId } } }
    );
    if (result.modifiedCount > 0) {
      // console.log("item removed sucessfully");
      res
        .status(200)
        .json({ message: "product removed successfully", data: result });
    } else {
      console.log("item not found in the  cart");
    }
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

  addwishlist: async (req, res) => {
    const userId = req.params.id;
    if (!userId) {
      return res.status(404).json({
        status: "failure",
        message: "user not found",
      });
    }

    const { productId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: "failure",
        message: "no product found",
      });
    }

    const findproduct = await User.findOne({
      _id: userId,
      wishlist: productId,
    });

    if (findproduct) {
      return res.status(404).json({
        status: "failure",
        message: "product already in the wishlist",
      });
    }

    const updateResult = await User.updateOne(
      { _id: userId },
      { $push: { wishlist: productId } }
    );
    console.log(updateResult, "ww");

    // check if the update was successful

    return res.status(201).json({
      status: "success",
      message: "product successfully added to wishlist",
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

  // Payment Section

  payment: async (req, res) => {
    const userId = req.params.id;

    const user = await User.findOne({ _id: userId }).populate("cart");
    console.log(user);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const cartProducts = user.cart;
    if (cartProducts.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "cart is empty",
        data: [],
      });
    }
    const lineitems = cartProducts.map((item) => {
      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: item.title,
            description: item.description,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: 1,
      };
    });
    session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineitems,
      mode: "payment",
      success_url: "http://localhost:3001/api/users/payment/success",
    });
    if (!session) {
      return res.json({
        status: "failure",
        message: "error occured on session side",
      });
    }
    sValue = {
      userId,
      user,
      session,
    };
    // console.log(sValue, "svaluw");
    res.status(200).json({
      status: "success",
      message: "stripe payment  session is created",
      url: session.url,
    });
  },
  success: async (req, res) => {
    try {
      const { id, user, session } = sValue;
      // console.log(sValue,"svalue");
      const userId = user._id;
      const cartItems = user.cart;
      const productId = cartItems.map((item) => item.productsId);

      const orders = await Order.create({
        userId: id,
        products: productId,
        order_id: session.id,
        payment_id: `demo ${Date.now()}`,
        total_amount: session.amount_total / 100,
      });
      if (!orders) {
        return res.json({
          status: "failure",
          message: "Error detected while inputting to order DB",
        });
      }

      const orderId = orders._id;
      const userUpdate = await User.updateOne(
        { _id: userId },
        { $push: { orders: orderId }, $set: { cart: [] } },
        { new: true }
      );
      if (userUpdate.nModified === 1) {
        res
          .status(200)
          .json({ status: "Success", message: "payment successfull" });
      } else {
        res
          .status(500)
          .json({ status: "Error", message: "Failed to update user data" });
      }
    } catch (error) {
      // console.log(error);
      res.status(500).json({
        status: "Error",
        message: "An error occured",
        error_message: error.message,
      });
    }
  },
};
