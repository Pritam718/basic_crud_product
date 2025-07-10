const path = require("path");
const fs = require("fs");
const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const isValid = FILE_TYPE_MAP[file.mimetype];
//     let uploadError = new Error("Invalid Image type");
//     if (isValid) {
//       uploadError = null;
//     }
//     cb(uploadError, "uploads");
//   },
//   filename: function (req, file, cb) {
//     const filename = file.originalname.split(" ").join("-");
//     const extension = FILE_TYPE_MAP[file.mimetype];
//     cb(null, `${filename}-${Date.now()}.${extension}`);
//   },
// });

const productImageUpload = multer({ storage: multer.memoryStorage() });
module.exports = productImageUpload;
