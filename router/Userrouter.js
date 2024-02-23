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
  .post("/addtocart/:id", tryCatchMiddleware(userController.addToCart))
  .get("/viewcart/:id", tryCatchMiddleware(userController.viewCartProduct))
  .post("/addtowishlist/:id", tryCatchMiddleware(userController.addwishlist))
  .get("/showwishlist/:id", tryCatchMiddleware(userController.showWishlist))
  .delete(
    "/deletewishlist/:id",
    tryCatchMiddleware(userController.deletewishlist)
  )
  .post("/:id/payment", tryCatchMiddleware(userController.payment))
  .get("/payment/success", tryCatchMiddleware(userController.success))
  .post("/payment/cancel", tryCatchMiddleware(userController.PaymentCancel))
  .get("/:id/orders", tryCatchMiddleware(userController.OrderDetails));

module.exports = router;
