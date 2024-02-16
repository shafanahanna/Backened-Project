require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const userRouter = require("./router/Userrouter");
const adminRouter = require("./router/Adminrouter");
const app = express();
const port = 3001;

app.use(express.json());
app.use("/", userRouter);
app.listen(port, (err) => {
  if (err) {
    console.log(`eerror detected ${err}`);
  }
  console.log(`server running on ${port}`);
});
