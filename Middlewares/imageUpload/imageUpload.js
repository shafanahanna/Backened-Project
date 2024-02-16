const fs = require("fs");
const path = require("path");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: path.join(__dirname, "uploads"),
  filename: (req, file, cb) => {
    cb(null, Date.now + file.originalname);
  },
});

const upload = multer({ storage });
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});
//  console.log(cloudinary);

const imageUpload = (req, res, next) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "Project-images",
      });
      req.body.image = result.secure_url;
      fs.unlink(req.file.path, (unlinker) => {
        if (unlinker) {
          console.log("Error deleting localfiles", unlinker);
        }
      });
      next();
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error, uploading file to cloudinary" });
    }
  });
};
// console.log(imageUpload);

module.exports = imageUpload;
