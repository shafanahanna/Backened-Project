require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const userRouter = require("./router/Userrouter");
const adminRouter = require("./router/Adminrouter");
const app = express();
const port = 3001;

const mongodb = "mongodb://localhost:27017/Backend";

main().catch((err) => {
  console.log(err);
});
async function main() {
  await mongoose.connect(mongodb);
  console.log("db connected");
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use("/api/users", userRouter);
app.use("/api/admin", adminRouter);
app.listen(port, (err) => {
  if (err) {
    console.log(`eerror detected ${err}`);
  }
  console.log(`server running on ${port}`);
});
