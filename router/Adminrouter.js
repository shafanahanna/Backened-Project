const express = require("express");
const router = express.Router();
const admin = require("../Controller/Admincontroller");
const verifyToken = require("../Middlewares/Adminauth");

const tryCatchMiddleware = require("../Middlewares/Trycatchhandler");
const imageUpload = require("../Middlewares/imageUpload");
const adminController = require("../Controller/Admincontroller");

router

  .post("/adminlogin", tryCatchMiddleware(admin.login))

  .use(verifyToken)

  .get("/users", tryCatchMiddleware(admin.allUser))
  .get("/users/:id", tryCatchMiddleware(admin.useById))
  .post("/products", imageUpload, tryCatchMiddleware(admin.createProduct))
  .get("/allproducts", tryCatchMiddleware);
