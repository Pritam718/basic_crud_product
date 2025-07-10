const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const csvController = require("../controllers/csvController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(
      null,
      path.join(__dirname, "../../public/csvUploads"),
      function (err, success) {
        if (err) {
          throw err;
        }
      }
    );
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const csvupload = multer({ storage: storage });

router.post("/csv/users", csvupload.single("file"), csvController.addcsvFile);
router.get("/csv",csvController.getFile);

module.exports = router;
