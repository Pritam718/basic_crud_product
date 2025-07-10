const express = require("express");
const productImageUpload = require("../helper/productImage");
const apiProductController = require("../controllers/apiProductController");
const router = express.Router();

router.get("/", apiProductController.getProduct);
router.get("/specific/:id", apiProductController.getSpecificProduct);
router.get("/search", apiProductController.search);
router.post(
  "/create",
  productImageUpload.array("image", 6),
  apiProductController.createProduct
);
router.get("/edit/:id", apiProductController.editProduct);
router.post(
  "/update/:id",
  productImageUpload.array("image", 6),
  apiProductController.updateProduct
);
router.get("/delete/:id", apiProductController.deleteProduct);

// slug
router.post("/create/data", apiProductController.createBySlug);
router.get("/get/data/:slug", apiProductController.getBySlug);

module.exports = router;
