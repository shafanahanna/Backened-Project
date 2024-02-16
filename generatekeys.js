const crypto = require("crypto");

const key1 = crypto.randomBytes(64).toString("hex");
console.log(key1);
