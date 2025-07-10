const { Product, productSchemaValidate } = require("../model/product.model");
const path = require("path");
const fs = require("fs");
const bucket = require("../config/firebaseconfig");
const pdf = require("pdf-creator-node");
const options = require("../helper/options");

const extractFilePathFromUrl = (url) => {
  const decodedUrl = decodeURIComponent(url);
  const matches = decodedUrl.match(/\/o\/(.*?)\?/);
  return matches ? matches[1] : null;
};

class ProductController {
  async getProduct(req, res) {
    try {
      const data = await Product.find();
      res.render("product", {
        productData: data,
      });
    } catch (error) {
      req.flash("error_msg", "Product Fetch failed");
      res.redirect(`/products`);
    }
  }

  async getSpecificProduct(req, res) {
    try {
      const id = req.params.id;
      const data = await Product.findById(id);
      if (data === null) {
        req.flash("error_msg", "Data not found");
        res.redirect(`/products`);
      } else {
        res.render("productOne", { productData: data });
      }
    } catch (error) {
      req.flash("error_msg", "Specific Product fetch failed");
      res.redirect(`/products`);
    }
  }
  async productCreateForm(req, res) {
    try {
      res.render("productForm");
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
  async search(req, res) {
    try {
      const { brand, color, size, minPrice, maxPrice } = req.query;

      const queryObj = {};
      if (brand) {
        // queryObj.brand = { $regex: brand, $options: "i" };
        queryObj.brand = { $in: brand };
      }
      if (size) {
        queryObj.size = { $in: size };
      }
      if (color) {
        queryObj.color = { $in: color };
      }
      if (minPrice || maxPrice) {
        queryObj.price = {};

        if (minPrice) {
          queryObj.price.$gte = parseFloat(minPrice);
        }

        if (maxPrice) {
          queryObj.price.$lte = parseFloat(maxPrice);
        }
      }

      const data = await Product.find(queryObj);

      res.render("product", { productData: data });
    } catch (error) {
      res.status(500).json({
        message: "Search failed",
      });
    }
  }
  async createProduct(req, res) {
    try {
      const dataBody = {
        productName: req.body.productName,
        productDesc: req.body.productDesc,
        price: req.body.price,
        size: req.body.size,
        color: req.body.color,
        brand: req.body.brand,
      };
      // validation
      const { error, value } = productSchemaValidate.validate(dataBody);

      const { productName, productDesc, price, size, color, brand } = req.body;

      if (error) {
        req.flash("error_msg", error.details[0].message);
        res.redirect(`/products/createform`);
      } else {
        const productData = new Product({
          productName,
          productDesc,
          price,
          size,
          color,
          brand,
        });
        if (req.files) {
          const imagePaths = await Promise.all(
            req.files.map(async (file) => {
              const firebasepath = `products/${Date.now()}_${
                file.originalname
              }`;
              await bucket.file(firebasepath).save(file.buffer, {
                public: true,
                metadata: { contentType: file.mimetype },
              });
              return `https://storage.googleapis.com/${bucket.name}/${firebasepath}`;
            })
          );

          productData.image = imagePaths;
        }

        const data = await productData.save();

        req.flash("success_msg", "Product created Successfully");
        res.redirect("/products");
      }
    } catch (error) {
      req.flash("error_msg", "Product create Failed");
      res.redirect(`/products/createform`);
    }
  }
  async editProduct(req, res) {
    try {
      const id = req.params.id;
      // console.log(id);
      const editData = await Product.findById(id);

      if (editData) {
        res.render("productEdit", { data: editData });
      } else {
        req.flash("error_msg", "Product Not Found");
        res.redirect(`/products`);
      }
    } catch (error) {
      res.status(500).json({
        message: "Edit failed",
        error,
      });
    }
  }
  async updateProduct(req, res) {
    try {
      const id = req.params.id;
      const existingProduct = await Product.findById(id);
      if (!existingProduct) {
        req.flash("error_msg", "Product Not Found");
        res.redirect(`/products`);
      }

      let updatedImagePaths = existingProduct.image;
      if (req.files && req.files.length > 0) {
        for (const url of existingProduct.image) {
          const filePath = extractFilePathFromUrl(url);
          if (filePath) {
            await bucket
              .file(filePath)
              .delete()
              .catch((err) => {
                console.error("Failed to delete from Firebase:", err.message);
              });
          }
        }
        const imagePaths = await Promise.all(
          req.files.map(async (file) => {
            const firebasepath = `products/${Date.now()}_${file.originalname}`;
            await bucket.file(firebasepath).save(file.buffer, {
              public: true,
              metadata: { contentType: file.mimetype },
            });
            return `https://storage.googleapis.com/${bucket.name}/${firebasepath}`;
          })
        );
        updatedImagePaths = imagePaths;
      }

      const { productName, productDesc, price, size, color, brand } = req.body;
      const data = {
        productName,
        productDesc,
        price,
        size,
        color,
        brand,
      };
      const { error, value } = productSchemaValidate.validate(data);
      if (error) {
        req.flash("error_msg", error.details[0].message);
        return res.redirect(`/products/edit/${id}`);
      } else {
        const updateData = await Product.findByIdAndUpdate(
          id,
          {
            productName,
            productDesc,
            price,
            size,
            color,
            brand,
            image: updatedImagePaths,
          },
          { new: true }
        );
        if (!updateData) {
          req.flash("error_msg", "Product Not Found");
          res.redirect(`/products/edit/${id}`);
        }

        req.flash("success_msg", "Product updated Successfully");
        res.redirect(`/products/specific/${id}`);
      }
    } catch (error) {
      res.status(500).json({
        message: "update failed",
        error,
      });
    }
  }
  async deleteProduct(req, res) {
    try {
      const id = req.params.id;
      const deleteData = await Product.findById(id);
      if (!deleteData) {
        req.flash("error_msg", "Product not found");
        res.redirect(`/products/`);
      }

      const updateData = await Product.findByIdAndUpdate(id, {
        isDeleted: false,
      });

      req.flash("delete_msg", "Delete Successfully");
      res.redirect("/products");
    } catch (error) {
      res.status(500).json({
        message: "Delete failed",
        error,
      });
    }
  }
  async pdfGenerator(req, res) {
    try {
      const id = req.params.id;
      const data = await Product.findById(id).lean();

      if (!data) {
        return res.status(404).send("Product not found");
      }
      console.log("Raw data from DB:", data);

      const products = [data];

      const html = fs.readFileSync(
        path.join(__dirname, "../../views/template.html"),
        "utf8"
      );
      const filename = `${Date.now()}_doc.pdf`;
      const document = {
        html,
        data: {
          products,
        },
        path: `./docs/${filename}`,
        type: "",
      };

      const pdfRes = await pdf.create(document, options);
      console.log("Pdf generated", pdfRes);
      const filepath = `http://localhost:3008/docs/${filename}`;
      res.render("download", {
        path: filepath,
      });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new ProductController();
