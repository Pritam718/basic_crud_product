const express = require("express");
const ProductController = require("../controllers/Product.Controller");
const productImageUpload = require("../helper/productImage");
const { Auth } = require("../middleware/auth");
const router = express.Router();

router.get("/", ProductController.getProduct);
router.get("/specific/:id", ProductController.getSpecificProduct);
router.get("/search", ProductController.search);

router.use(Auth);
router.get("/createform", ProductController.productCreateForm);
router.post(
  "/create",
  productImageUpload.array("image", 6),
  ProductController.createProduct
);
router.get("/edit/:id", ProductController.editProduct);
router.post(
  "/update/:id",
  productImageUpload.array("image", 6),
  ProductController.updateProduct
);
router.get("/delete/:id", ProductController.deleteProduct);
router.get("/productPdf/:id", ProductController.pdfGenerator);

module.exports = router;
