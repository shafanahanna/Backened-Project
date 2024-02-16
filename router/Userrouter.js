const express = require("express");
const router = express.Router();
const userController = require("../Controller/Usercontroller");
const tryCatchMiddleware = require("../Middlewares/Trycatchhandler");
const verifyToken = require("../Middlewares/Userauth");

router

  .post("/register", tryCatchMiddleware(userController.userRegister))
  .post("/userlogin", tryCatchMiddleware(userController.userLogin))
  .use(verifyToken)
  .get("/viewproduct", tryCatchMiddleware(userController.viewProduct))
  .get("/products/:id", tryCatchMiddleware(userController.productById))
  .post("/addcart/:id", tryCatchMiddleware(userController.addToCart))
  .get("/viewcart/:id", tryCatchMiddleware(userController.viewCartProduct))
  .post("/addtowishlist/:id", tryCatchMiddleware(userController.addtowishlist))
  .post("/addtowishlist/:id", tryCatchMiddleware(userController.addtowishlist))
  .get("/showwishlist/:id", tryCatchMiddleware(userController.showWishlist))
  .delete("/deletewishlist", tryCatchMiddleware(userController.deletewishlist));

module.exports = router;
